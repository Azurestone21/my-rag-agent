import { create } from 'zustand'
import type { KnowledgeBaseDto } from '@my-rag-agent/shared'
import { api } from '@/service'

type KnowledgeBaseState = {
  knowledgeBases: KnowledgeBaseDto[]
  selectedKbId: string
  loading: boolean
  load: () => Promise<void>
  selectKb: (id: string) => void
  createKb: (
    name: string,
    description: string,
  ) => Promise<KnowledgeBaseDto>
  deleteKb: (id: string) => Promise<void>
  updateKb: (
    id: string,
    name: string,
    description: string,
  ) => Promise<KnowledgeBaseDto>
}

export const useKnowledgeBaseStore = create<KnowledgeBaseState>((set) => ({
  knowledgeBases: [],
  selectedKbId: '',
  loading: false,
  load: async () => {
    set({ loading: true })
    try {
      const knowledgeBases = await api.knowledgeBase.list()
      set((state) => ({
        knowledgeBases,
        loading: false,
        selectedKbId:
          state.selectedKbId &&
          knowledgeBases.some((kb) => kb.id === state.selectedKbId)
            ? state.selectedKbId
            : (knowledgeBases[0]?.id ?? ''),
      }))
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },
  selectKb: (id) => set({ selectedKbId: id }),
  createKb: async (name, description) => {
    const kb = await api.knowledgeBase.create(name, description)
    set((state) => ({
      knowledgeBases: [...state.knowledgeBases, kb],
      selectedKbId: kb.id,
    }))
    return kb
  },
  deleteKb: async (id) => {
    await api.knowledgeBase.delete(id)
    set((state) => {
      const remaining = state.knowledgeBases.filter((kb) => kb.id !== id)
      return {
        knowledgeBases: remaining,
        selectedKbId:
          state.selectedKbId === id
            ? (remaining[0]?.id ?? '')
            : state.selectedKbId,
      }
    })
  },
  updateKb: async (id, name, description) => {
    const updated = await api.knowledgeBase.update(id, name, description)
    set((state) => ({
      knowledgeBases: state.knowledgeBases.map((kb) =>
        kb.id === id ? updated : kb,
      ),
    }))
    return updated
  },
}))

export function useSelectedKbId(): string {
  return useKnowledgeBaseStore((state) => state.selectedKbId)
}
