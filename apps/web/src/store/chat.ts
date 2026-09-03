import { create } from 'zustand'
import type {
  ChatMessageDto,
  SearchParamsDto,
  ServiceCallDto,
} from '@my-rag-agent/shared'
import { api } from '@/service'
import { chatApi } from '@/service/chat'

const defaultParams: SearchParamsDto = {
  resultCount: 10,
  minSimilarity: 0,
  rerankModel: '暂不启用',
  denseWeight: 0.5,
}

type ChatState = {
  params: SearchParamsDto
  setParams: (params: Partial<SearchParamsDto>) => void
  messages: ChatMessageDto[]
  serviceCalls: ServiceCallDto[]
  loading: boolean
  abortController: AbortController | null
  loadServiceCalls: (knowledgeBaseId?: string) => Promise<void>
  sendMessage: (knowledgeBaseId: string, content: string) => Promise<void>
  clearMessages: () => void
  stop: () => void
  createServiceCall: (
    name: string,
    knowledgeBaseId: string,
    topK: number,
  ) => Promise<ServiceCallDto>
  deleteServiceCall: (id: string) => Promise<void>
}

function now(): string {
  return new Date().toISOString()
}

export const useChatStore = create<ChatState>((set, get) => ({
  params: defaultParams,
  setParams: (params) =>
    set((state) => ({ params: { ...state.params, ...params } })),
  messages: [],
  serviceCalls: [],
  loading: false,
  abortController: null as AbortController | null,
  loadServiceCalls: async (knowledgeBaseId) => {
    const serviceCalls = await api.serviceCall.list(knowledgeBaseId)
    set({ serviceCalls })
  },
  clearMessages: () => {
    get().abortController?.abort()
    set({ messages: [], loading: false, abortController: null })
  },
  sendMessage: async (knowledgeBaseId, content) => {
    get().abortController?.abort()
    const controller = new AbortController()
    set({ abortController: controller })

    const userMessage: ChatMessageDto = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      createdAt: now(),
    }
    const assistantId = `msg-${Date.now() + 1}`
    const emptyAssistant: ChatMessageDto = {
      id: assistantId,
      role: 'assistant',
      content: '',
      createdAt: now(),
    }
    set((state) => ({
      messages: [...state.messages, userMessage, emptyAssistant],
      loading: true,
    }))

    try {
      const { params } = get()
      await chatApi.stream(
        {
          knowledgeBaseId,
          query: content,
          topK: params.resultCount,
          minSimilarity: params.minSimilarity,
          temperature: 0.3,
        },
        {
          onSources: (sources) => {
            set((state) => ({
              messages: state.messages.map((m) =>
                m.id === assistantId ? { ...m, sources } : m,
              ),
            }))
          },
          onContent: (delta) => {
            set((state) => ({
              messages: state.messages.map((m) =>
                m.id === assistantId ? { ...m, content: m.content + delta } : m,
              ),
            }))
          },
          onDone: () => {
            set({ loading: false, abortController: null })
          },
          onError: () => {
            set((state) => ({
              messages: state.messages.map((m) =>
                m.id === assistantId
                  ? { ...m, content: m.content || '生成失败' }
                  : m,
              ),
              loading: false,
              abortController: null,
            }))
          },
        },
        controller.signal,
      )
    } catch (error) {
      const name =
        error && typeof error === 'object' && 'name' in error
          ? (error as { name: string }).name
          : ''
      if (name === 'AbortError') {
        set({ loading: false, abortController: null })
      } else {
        set({ loading: false, abortController: null })
        throw error
      }
    }
  },
  stop: () => {
    get().abortController?.abort()
    set({ abortController: null })
  },
  createServiceCall: async (name, knowledgeBaseId, topK) => {
    const service = await api.serviceCall.create(name, knowledgeBaseId, topK)
    set((state) => ({ serviceCalls: [...state.serviceCalls, service] }))
    return service
  },
  deleteServiceCall: async (id) => {
    await api.serviceCall.delete(id)
    set((state) => ({
      serviceCalls: state.serviceCalls.filter((svc) => svc.id !== id),
    }))
  },
}))
