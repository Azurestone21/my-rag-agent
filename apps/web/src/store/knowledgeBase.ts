import { create } from 'zustand'
import type {
  CreateKnowledgeBaseDto,
  KnowledgeBaseVo,
  UpdateKnowledgeBaseDto,
} from '@my-rag-agent/shared'
import { api } from '@/service'
import { persist } from 'zustand/middleware'

type KnowledgeBaseState = {
  knowledgeBases: KnowledgeBaseVo[]
  selectedKbId: string
  loading: boolean
  load: () => Promise<void>
  selectKb: (id: string) => void
  createKb: (dto: CreateKnowledgeBaseDto) => Promise<KnowledgeBaseVo>
  deleteKb: (id: string) => Promise<void>
  updateKb: (dto: UpdateKnowledgeBaseDto) => Promise<KnowledgeBaseVo>
}

export const useKnowledgeBaseStore = create<KnowledgeBaseState>()(
  persist(
    (set) => ({
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
      createKb: async (dto) => {
        const kb = await api.knowledgeBase.create(dto)
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
      updateKb: async (dto) => {
        const updated = await api.knowledgeBase.update(dto)
        set((state) => ({
          knowledgeBases: state.knowledgeBases.map((kb) =>
            kb.id === dto.id ? updated : kb,
          ),
        }))
        return updated
      },
    }),
    {
      name: 'knowledge-base-store',
    },
  ),
)

export function useSelectedKbId(): string {
  return useKnowledgeBaseStore((state) => state.selectedKbId)
}
