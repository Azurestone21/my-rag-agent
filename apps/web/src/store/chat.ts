import { create } from 'zustand'
import type {
  ChatMessageDto,
  SearchParamsDto,
  ServiceCallDto,
} from '@my-rag-agent/shared'
import { api } from '@/service'

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
  loadServiceCalls: () => Promise<void>
  sendMessage: (knowledgeBaseId: string, content: string) => Promise<void>
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
  loadServiceCalls: async () => {
    const serviceCalls = await api.serviceCall.list()
    set({ serviceCalls })
  },
  sendMessage: async (knowledgeBaseId, content) => {
    const userMessage: ChatMessageDto = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      createdAt: now(),
    }
    set((state) => ({ messages: [...state.messages, userMessage] }))
    set({ loading: true })
    try {
      const { params } = get()
      const answer = await api.chat.run({
        knowledgeBaseId,
        query: content,
        topK: params.resultCount,
        minSimilarity: params.minSimilarity,
        temperature: 0.3,
      })
      const assistantMessage: ChatMessageDto = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: answer.answer,
        sources: answer.sources,
        createdAt: now(),
      }
      set((state) => ({
        messages: [...state.messages, assistantMessage],
        loading: false,
      }))
    } catch (error) {
      set({ loading: false })
      throw error
    }
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
