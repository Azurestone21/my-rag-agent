import { create } from 'zustand'
import {
  defaultSearchParams,
  mockSearchResults,
  type SearchParams,
  type SearchResultItem,
} from '@/mock/data'

type SearchState = {
  params: SearchParams
  setParams: (params: Partial<SearchParams>) => void
  query: string
  results: SearchResultItem[]
  history: string[]
  runSearch: (query: string) => void
  clearResults: () => void
}

export const useSearchStore = create<SearchState>((set) => ({
  params: defaultSearchParams,
  setParams: (params) => set((state) => ({ params: { ...state.params, ...params } })),
  query: '',
  results: [],
  history: [],
  runSearch: (query) =>
    set((state) => {
      const trimmed = query.trim()
      if (!trimmed) return { results: [] }
      const filtered = mockSearchResults.filter(
        (r) =>
          r.content.includes(trimmed) ||
          r.documentName.includes(trimmed) ||
          trimmed === '小米' ||
          trimmed === '小米9',
      )
      const results = filtered.length > 0 ? filtered : mockSearchResults
      return {
        query: trimmed,
        results,
        history: [trimmed, ...state.history.filter((h) => h !== trimmed)].slice(0, 10),
      }
    }),
  clearResults: () => set({ results: [], query: '' }),
}))
