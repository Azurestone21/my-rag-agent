export type DocumentStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface DocumentDto {
  id: string
  knowledgeBaseId: string
  name: string
  status: DocumentStatus
  strategy: string
  chunkCount: number
  importMethod: string
  updatedAt: string
}
