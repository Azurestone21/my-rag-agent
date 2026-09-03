import { create } from 'zustand'
import type { DocumentDto, ChunkProcessConfig } from '@my-rag-agent/shared'
import { api } from '@/service'

type DocumentState = {
  documents: DocumentDto[]
  searchQuery: string
  loading: boolean
  load: (knowledgeBaseId?: string) => Promise<void>
  setSearchQuery: (query: string) => void
  upload: (knowledgeBaseId: string, file: File, config?: ChunkProcessConfig) => Promise<DocumentDto>
  remove: (id: string) => Promise<void>
}

export const useDocumentStore = create<DocumentState>((set) => ({
  documents: [],
  searchQuery: '',
  loading: false,
  load: async (knowledgeBaseId) => {
    set({ loading: true })
    try {
      const documents = await api.document.list(knowledgeBaseId)
      set({ documents, loading: false })
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },
  setSearchQuery: (query) => set({ searchQuery: query }),
  upload: async (knowledgeBaseId, file, config) => {
    const doc = await api.document.upload(knowledgeBaseId, file, config)
    set((state) => ({ documents: [doc, ...state.documents] }))
    return doc
  },
  remove: async (id) => {
    await api.document.delete(id)
    set((state) => ({
      documents: state.documents.filter((doc) => doc.id !== id),
    }))
  },
}))
