import { create } from 'zustand'
import {
  chatMessages as initialMessages,
  defaultSearchParams,
  mockSearchResults,
  serviceCalls as initialServiceCalls,
  type ChatMessage,
  type SearchParams,
  type ServiceCall,
} from '@/mock/data'

type ChatState = {
  params: SearchParams
  setParams: (params: Partial<SearchParams>) => void
  messages: ChatMessage[]
  serviceCalls: ServiceCall[]
  sendMessage: (content: string) => void
  createServiceCall: (name: string, topK: number) => ServiceCall
  deleteServiceCall: (id: string) => void
}

export const useChatStore = create<ChatState>((set) => ({
  params: defaultSearchParams,
  setParams: (params) => set((state) => ({ params: { ...state.params, ...params } })),
  messages: initialMessages,
  serviceCalls: initialServiceCalls,
  sendMessage: (content) =>
    set((state) => {
      const userMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content,
        createdAt: '2026/08/31 00:00',
      }
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content:
          '已检索到知识库中的相关切片，以下是根据命中的内容整理的回答：\n1. 2019年9月18日售小米9 1台，单价2799元，订单状态为交易成功；\n2. 2019年9月15日，Redmi Note 8 Pro 5台，单价1399元，订单状态为交易成功。\n我可以阅读知识库的资料并使用自然语言回答你的问题。',
        sources: mockSearchResults,
        createdAt: '2026/08/31 00:00',
      }
      return {
        messages: [...state.messages, userMessage, assistantMessage],
      }
    }),
  createServiceCall: (name, topK) => {
    const serviceCall: ServiceCall = {
      id: `svc_${Date.now()}`,
      name,
      topK,
      apiKey: `mk-${Math.random().toString(36).slice(2, 18)}`,
      createdAt: '2026/08/31 00:00',
    }
    set((state) => ({
      serviceCalls: [...state.serviceCalls, serviceCall],
    }))
    return serviceCall
  },
  deleteServiceCall: (id) =>
    set((state) => ({
      serviceCalls: state.serviceCalls.filter((svc) => svc.id !== id),
    })),
}))
