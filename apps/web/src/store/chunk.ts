import { create } from 'zustand'
import type { ChunkDto } from '@my-rag-agent/shared'
import { api } from '@/service'

type ChunkState = {
  chunks: ChunkDto[]
  selectedDocumentId: string
  searchQuery: string
  loading: boolean
  load: (documentId?: string, knowledgeBaseId?: string) => Promise<void>
  setSelectedDocumentId: (id: string) => void
  setSearchQuery: (query: string) => void
  add: (documentId: string, content: string) => Promise<void>
  update: (id: string, content: string) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useChunkStore = create<ChunkState>((set) => ({
  chunks: [],
  selectedDocumentId: '',
  searchQuery: '',
  loading: false,
  load: async (documentId, knowledgeBaseId) => {
    set({ loading: true })
    try {
      const chunks = await api.chunk.list(documentId, knowledgeBaseId)
      set({ chunks, loading: false })
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },
  setSelectedDocumentId: (id) => set({ selectedDocumentId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  add: async (documentId, content) => {
    const chunk = await api.chunk.create(documentId, content)
    set((state) => ({
      chunks: [...state.chunks, chunk].sort(
        (a, b) => a.index - b.index,
      ),
    }))
  },
  update: async (id, content) => {
    const updated = await api.chunk.update(id, content)
    set((state) => ({
      chunks: state.chunks.map((chunk) =>
        chunk.id === id ? updated : chunk,
      ),
    }))
  },
  remove: async (id) => {
    await api.chunk.delete(id)
    set((state) => ({
      chunks: state.chunks.filter((chunk) => chunk.id !== id),
    }))
  },
}))
