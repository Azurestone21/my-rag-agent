import type { ChunkDto, ChunkProcessResultDto } from '@my-rag-agent/shared'
import { request, toQuery } from './request'

export const chunkApi = {
  /**
   * 获取切片列表，可按文档或知识库过滤
   * @param documentId 文档 ID（可选）
   * @param knowledgeBaseId 知识库 ID（可选，优先过滤）
   */
  list: (documentId?: string, knowledgeBaseId?: string) => {
    const query: Record<string, string> = {}
    if (documentId) query.documentId = documentId
    if (knowledgeBaseId) query.knowledgeBaseId = knowledgeBaseId
    return request<ChunkDto[]>(`/chunks${toQuery(query)}`)
  },
  /**
   * 处理文档：读取文件 → 文本切片 → 生成向量，并更新文档状态
   * @param documentId 文档 ID
   */
  process: (documentId: string) =>
    request<ChunkProcessResultDto>(`/chunks/process/${documentId}`, {
      method: 'POST',
    }),
  /**
   * 手动新增切片
   * @param documentId 所属文档 ID
   * @param content 切片内容
   */
  create: (documentId: string, content: string) =>
    request<ChunkDto>('/chunks', {
      method: 'POST',
      body: JSON.stringify({ documentId, content }),
    }),
  /**
   * 编辑切片内容（同步更新字符数）
   * @param id 切片 ID
   * @param content 新内容
   */
  update: (id: string, content: string) =>
    request<ChunkDto>(`/chunks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ content }),
    }),
  /**
   * 删除切片
   * @param id 切片 ID
   */
  delete: (id: string) => request<void>(`/chunks/${id}`, { method: 'DELETE' }),
}
