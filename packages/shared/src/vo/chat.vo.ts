import type { SearchVo } from './search.vo.js'

export interface ChatMessageVo {
  id: string
  role: string
  content: string
  sources?: SearchVo[]
  createdAt: string
}

export interface ChatAnswerVo {
  answer: string
  sources: SearchVo[]
}
