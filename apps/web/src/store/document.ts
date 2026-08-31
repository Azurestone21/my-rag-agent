import { create } from 'zustand'
import { documents as initialDocuments, type DocumentItem } from '@/mock/data'

type DocumentState = {
  documents: DocumentItem[]
  searchQuery: string
  setSearchQuery: (query: string) => void
  uploadDocument: (name: string) => void
  deleteDocument: (id: string) => void
}

export const useDocumentStore = create<DocumentState>((set) => ({
  documents: initialDocuments,
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  uploadDocument: (name) =>
    set((state) => ({
      documents: [
        {
          id: `doc-${Date.now()}`,
          knowledgeBaseId: 'kb_my-rag-agent',
          name,
          status: 'processing',
          strategy: 'my-rag-agent-init-version',
          chunkCount: 0,
          importMethod: '本地上传',
          updatedAt: '2026/08/31 00:00',
        },
        ...state.documents,
      ],
    })),
  deleteDocument: (id) =>
    set((state) => ({
      documents: state.documents.filter((doc) => doc.id !== id),
    })),
}))
