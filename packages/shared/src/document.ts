export type DocumentStatus = 'pending' | 'processing' | 'completed' | 'failed'

export type ChunkProcessConfig =
  | {
      fileType: 'text'
      splitMode: 'auto'
    }
  | {
      fileType: 'text'
      splitMode: 'custom'
      separator: string
      chunkSize: number
      chunkOverlap: number
    }
  | {
      fileType: 'table'
      headerRow: number
      dataRow: number
    }

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
