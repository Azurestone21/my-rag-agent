import { create } from 'zustand'
import type { ChunkVo, PageVo } from '@my-rag-agent/shared'
import { api } from '@/service'

type ChunkState = {
  chunks: PageVo<ChunkVo>
  selectedDocumentId: string
  keyword: string
  loading: boolean
  setSelectedDocumentId: (id: string) => void
  setKeyword: (keyword: string) => void
  load: (knowledgeBaseId?: string) => Promise<void>
  add: (documentId: string, content: string) => Promise<void>
  update: (id: string, content: string) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useChunkStore = create<ChunkState>((set, get) => ({
  chunks: {
    list: [],
    total: 0,
    havePrev: false,
    haveNext: true,
    pageNum: 1,
    pageSize: 10,
  },
  selectedDocumentId: '',
  keyword: '',
  loading: false,

  setSelectedDocumentId: (id) =>
    set((state) => ({
      chunks: { ...state.chunks, pageNum: 1, list: [], haveNext: true },
      selectedDocumentId: id,
    })),
  setKeyword: (keyword) =>
    set((state) => ({
      chunks: { ...state.chunks, pageNum: 1, list: [], haveNext: true },
      keyword: keyword,
    })),

  load: async (knowledgeBaseId?: string) => {
    const { selectedDocumentId, chunks, loading, keyword } = get()

    if (loading || !chunks.haveNext) return

    set({ loading: true })
    try {
      const page = await api.chunk.list({
        documentId: selectedDocumentId,
        knowledgeBaseId,
        pageNum: chunks.pageNum,
        pageSize: chunks.pageSize,
        keyword,
      })
      set((state) => ({
        chunks: {
          ...page,
          pageNum: chunks.pageNum + 1,
          list:
            chunks.pageNum === 1
              ? page.list
              : [...state.chunks.list, ...page.list],
        },
      }))
    } catch (error) {
      throw error
    } finally {
      set({ loading: false })
    }
  },

  add: async (documentId, content) => {
    const chunk = await api.chunk.create(documentId, content)
    set((state) => ({
      chunks: {
        ...state.chunks,
        list: [...state.chunks.list, chunk].sort((a, b) => a.index - b.index),
      },
    }))
  },
  update: async (id, content) => {
    const updated = await api.chunk.update(id, content)
    set((state) => ({
      chunks: {
        ...state.chunks,
        list: state.chunks.list.map((chunk) =>
          chunk.id === id ? updated : chunk,
        ),
      },
    }))
  },
  remove: async (id) => {
    await api.chunk.delete(id)
    set((state) => ({
      chunks: {
        ...state.chunks,
        list: state.chunks.list.filter((chunk) => chunk.id !== id),
      },
    }))
  },
}))
