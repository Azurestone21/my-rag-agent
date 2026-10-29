import type { ServiceCallDto } from '@my-rag-agent/shared'
import { request } from './request'

export const serviceCallApi = {
  /**
   * 获取服务调用列表
   * @param knowledgeBaseId 知识库 ID（可选，用于过滤）
   */
  list: (knowledgeBaseId?: string) =>
    request<ServiceCallDto[]>(
      `/service-calls${knowledgeBaseId ? `?knowledgeBaseId=${knowledgeBaseId}` : ''}`,
    ),
  /**
   * 生成问答 API（自动生成 API Key）
   * @param name 服务名称
   * @param knowledgeBaseId 知识库 ID
   * @param topK 返回数量
   * @returns 服务调用
   */
  create: (name: string, knowledgeBaseId: string, topK: number) =>
    request<ServiceCallDto>('/service-calls', {
      method: 'POST',
      body: JSON.stringify({ name, knowledgeBaseId, topK }),
    }),
  /**
   * 删除服务调用
   * @param id 服务调用 ID
   */
  delete: (id: string) =>
    request<void>(`/service-calls/${id}`, { method: 'DELETE' }),
}
