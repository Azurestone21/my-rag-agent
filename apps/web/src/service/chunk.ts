import type {
  ChunkVo,
  ChunkProcessVo,
  PageVo,
  ChunkGetPageDto,
} from '@my-rag-agent/shared'
import { request } from './request'

export const chunkApi = {
  /**
   * 获取切片列表，可按文档或知识库过滤
   * @param documentId 文档 ID（可选）
   * @param knowledgeBaseId 知识库 ID（可选，优先过滤）
   */
  list: ({
    documentId,
    knowledgeBaseId,
    pageNum,
    pageSize,
    keyword,
  }: ChunkGetPageDto) => {
    const query: Record<string, string | number | undefined> = {
      pageNum,
      pageSize,
    }
    if (documentId) query.documentId = documentId
    if (knowledgeBaseId) query.knowledgeBaseId = knowledgeBaseId
    if (keyword) query.keyword = keyword
    return request<PageVo<ChunkVo>>(`/chunks/page`, {
      method: 'POST',
      body: JSON.stringify(query),
    })
  },
  /**
   * 处理文档：读取文件 → 文本切片 → 生成向量，并更新文档状态
   * @param documentId 文档 ID
   */
  process: (documentId: string) =>
    request<ChunkProcessVo>(`/chunks/process/${documentId}`, {
      method: 'POST',
    }),
  /**
   * 手动新增切片
   * @param documentId 所属文档 ID
   * @param content 切片内容
   */
  create: (documentId: string, content: string) =>
    request<ChunkVo>('/chunks/create', {
      method: 'POST',
      body: JSON.stringify({ documentId, content }),
    }),
  /**
   * 编辑切片内容（同步更新字符数）
   * @param id 切片 ID
   * @param content 新内容
   */
  update: (id: string, content: string) =>
    request<ChunkVo>(`/chunks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ content }),
    }),
  /**
   * 删除切片
   * @param id 切片 ID
   */
  delete: (id: string) => request<void>(`/chunks/${id}`, { method: 'DELETE' }),
}
