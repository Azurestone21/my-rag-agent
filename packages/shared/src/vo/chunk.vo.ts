export interface ChunkVo {
  id: string
  documentId: string
  index: number
  content: string
  charCount: number
  updatedAt: string
}

export interface ChunkProcessVo {
  documentId: string
  chunkCount: number
}
