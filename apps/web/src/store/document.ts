import { create } from 'zustand'
import type {
  DocumentVo,
  ChunkProcessConfig,
  PageVo,
} from '@my-rag-agent/shared'
import { api } from '@/service'

type DocumentState = {
  documents: PageVo<DocumentVo>
  searchName: string
  loading: boolean
  load: (knowledgeBaseId?: string, name?: string) => Promise<void>
  setSearchName: (name: string) => void
  upload: (
    knowledgeBaseId: string,
    file: File,
    config?: ChunkProcessConfig,
  ) => Promise<DocumentVo>
  remove: (id: string) => Promise<void>
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: {
    list: [],
    total: 0,
    havePrev: false,
    haveNext: true,
    pageNum: 1,
    pageSize: 10,
  },
  searchName: '',
  loading: false,

  setSearchName: (name) =>
    set((state) => ({
      searchName: name,
      documents: { ...state.documents, pageNum: 1, list: [], haveNext: true },
    })),

  load: async (knowledgeBaseId, name?: string) => {
    const { loading, documents } = get()
    if (!knowledgeBaseId || loading || !documents.haveNext) {
      return
    }
    set({ loading: true })
    try {
      const result = await api.document.list({
        pageNum: documents.pageNum,
        pageSize: documents.pageSize,
        knowledgeBaseId,
        name: name || undefined,
      })
      set((state) => ({
        ...state,
        documents: {
          ...result,
          pageNum: documents.pageNum + 1,
          list: [...documents.list, ...result.list],
        },
      }))
    } catch (error) {
      throw error
    } finally {
      set({ loading: false })
    }
  },

  upload: async (knowledgeBaseId, file, config) => {
    const doc = await api.document.upload(knowledgeBaseId, file, config)
    set((state) => ({
      documents: { ...state.documents, list: [...state.documents.list, doc] },
    }))
    return doc
  },

  remove: async (id) => {
    await api.document.delete(id)
    set((state) => ({
      documents: {
        ...state.documents,
        list: state.documents.list.filter((doc) => doc.id !== id),
        total: state.documents.total - 1,
      },
    }))
  },
}))
