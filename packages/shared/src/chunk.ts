export interface ChunkDto {
  id: string
  documentId: string
  index: number
  content: string
  charCount: number
  updatedAt: string
}

export interface ChunkProcessResultDto {
  documentId: string
  chunkCount: number
}
