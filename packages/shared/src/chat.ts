import type { SearchResultDto } from './search.js'

export interface ChatMessageDto {
  id: string
  role: string
  content: string
  sources?: SearchResultDto[]
  createdAt: string
}

export interface ChatAnswerDto {
  answer: string
  sources: SearchResultDto[]
}
