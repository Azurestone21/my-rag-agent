import { create } from 'zustand'
import { chunks as initialChunks, type ChunkItem } from '@/mock/data'

type ChunkState = {
  chunks: ChunkItem[]
  selectedDocumentId: string
  searchQuery: string
  setSelectedDocumentId: (id: string) => void
  setSearchQuery: (query: string) => void
  addChunk: (content: string) => void
  updateChunk: (chunkId: string, index: number, content: string) => void
  deleteChunk: (chunkId: string, index: number) => void
}

export const useChunkStore = create<ChunkState>((set) => ({
  chunks: initialChunks,
  selectedDocumentId: '',
  searchQuery: '',
  setSelectedDocumentId: (id) => set({ selectedDocumentId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  addChunk: (content) =>
    set((state) => {
      const maxIndex = state.chunks.reduce((max, c) => Math.max(max, c.index), -1)
      const chunk: ChunkItem = {
        id: `doc-${Date.now()}`,
        documentId: state.selectedDocumentId || 'doc-75d132b9-c537-421e-9222-8c1aa0ebab7',
        index: maxIndex + 1,
        content,
        charCount: content.length,
        updatedAt: '2026/08/31 00:00',
      }
      return { chunks: [...state.chunks, chunk] }
    }),
  updateChunk: (chunkId, index, content) =>
    set((state) => ({
      chunks: state.chunks.map((chunk) =>
        chunk.id === chunkId && chunk.index === index
          ? { ...chunk, content, charCount: content.length }
          : chunk,
      ),
    })),
  deleteChunk: (chunkId, index) =>
    set((state) => ({
      chunks: state.chunks.filter(
        (chunk) => !(chunk.id === chunkId && chunk.index === index),
      ),
    })),
}))
