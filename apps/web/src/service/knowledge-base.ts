import type { KnowledgeBaseDto } from '@my-rag-agent/shared'
import { request } from './request'

export const knowledgeBaseApi = {
  /**
   * 获取知识库列表（含文档数/切片数统计）
   * @returns 知识库列表
   */
  list: () => request<KnowledgeBaseDto[]>('/knowledge-bases'),
  /**
   * 创建知识库
   * @param name 名称
   * @param description 描述
   * @returns 知识库
   */
  create: (name: string, description: string) =>
    request<KnowledgeBaseDto>('/knowledge-bases', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    }),
  /**
   * 更新知识库
   * @param id 知识库 ID
   * @param name 名称（可选）
   * @param description 描述（可选）
   */
  update: (id: string, name?: string, description?: string) =>
    request<KnowledgeBaseDto>(`/knowledge-bases/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name, description }),
    }),
  /**
   * 删除知识库（级联删除其文档与切片）
   * @param id 知识库 ID
   */
  delete: (id: string) =>
    request<void>(`/knowledge-bases/${id}`, { method: 'DELETE' }),
}
