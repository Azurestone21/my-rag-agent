import { create } from 'zustand'
import type {
  SearchParamsDto,
  SearchResultDto,
} from '@my-rag-agent/shared'
import { api } from '@/service'

const defaultParams: SearchParamsDto = {
  resultCount: 10,
  minSimilarity: 0.5,
  rerankModel: '0',
  denseWeight: 0.5,
}

type SearchState = {
  params: SearchParamsDto
  setParams: (params: Partial<SearchParamsDto>) => void
  query: string
  setQuery: (query: string) => void
  results: SearchResultDto[]
  history: string[]
  loading: boolean
  runSearch: (knowledgeBaseId: string) => Promise<void>
  clearResults: () => void
}

export const useSearchStore = create<SearchState>((set, get) => ({
  params: defaultParams,
  setParams: (params) =>
    set((state) => ({ params: { ...state.params, ...params } })),
  query: '',
  setQuery: (query) => set({ query }),
  results: [],
  history: [],
  loading: false,
  runSearch: async (knowledgeBaseId) => {
    const { query, params } = get()
    const trimmed = query.trim()
    if (!trimmed || !knowledgeBaseId) return
    set({ loading: true })
    try {
      const results = await api.search.run({
        knowledgeBaseId,
        query: trimmed,
        topK: params.resultCount,
        minSimilarity: params.minSimilarity,
        denseWeight: params.denseWeight,
        rerankModel: params.rerankModel === '0' ? '' : params.rerankModel,
      })
      set((state) => ({
        results,
        loading: false,
        history: [trimmed, ...state.history.filter((h) => h !== trimmed)].slice(
          0,
          10,
        ),
      }))
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },
  clearResults: () => set({ results: [], query: '' }),
}))
