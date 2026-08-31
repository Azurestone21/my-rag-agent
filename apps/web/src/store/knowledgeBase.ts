import { create } from 'zustand'
import { knowledgeBases, type KnowledgeBase } from '@/mock/data'

type KnowledgeBaseState = {
  knowledgeBases: KnowledgeBase[]
  selectedKbId: string
  selectKb: (id: string) => void
  createKb: (name: string, description: string) => void
  deleteKb: (id: string) => void
}

export const useKnowledgeBaseStore = create<KnowledgeBaseState>((set) => ({
  knowledgeBases,
  selectedKbId: knowledgeBases[0]?.id ?? '',
  selectKb: (id) => set({ selectedKbId: id }),
  createKb: (name, description) =>
    set((state) => {
      const kb: KnowledgeBase = {
        id: `kb_${Date.now()}`,
        name,
        description,
        documentCount: 0,
        chunkCount: 0,
        updatedAt: '2026/08/31 00:00',
      }
      return {
        knowledgeBases: [...state.knowledgeBases, kb],
        selectedKbId: kb.id,
      }
    }),
  deleteKb: (id) =>
    set((state) => {
      const remaining = state.knowledgeBases.filter((kb) => kb.id !== id)
      return {
        knowledgeBases: remaining,
        selectedKbId:
          state.selectedKbId === id ? (remaining[0]?.id ?? '') : state.selectedKbId,
      }
    }),
}))
