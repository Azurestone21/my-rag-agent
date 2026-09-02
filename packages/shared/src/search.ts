export interface SearchParamsDto {
  resultCount: number
  minSimilarity: number
  rerankModel: string
  denseWeight: number
}

export interface SearchResultDto {
  chunkId: string
  documentName: string
  content: string
  similarity: number
}
