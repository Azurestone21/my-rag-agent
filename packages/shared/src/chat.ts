import type { SearchResultDto } from './search.js'

export interface ChatMessageDto {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: SearchResultDto[]
  createdAt: string
}

export interface ChatAnswerDto {
  answer: string
  sources: SearchResultDto[]
}
