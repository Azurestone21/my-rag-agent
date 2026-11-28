import type {
  CreateKnowledgeBaseDto,
  KnowledgeBaseVo,
  UpdateKnowledgeBaseDto,
} from '@my-rag-agent/shared'
import { request } from './request'

export const knowledgeBaseApi = {
  /**
   * 获取知识库列表（含文档数/切片数统计）
   * @returns 知识库列表
   */
  list: () => request<KnowledgeBaseVo[]>('/knowledge-bases'),

  /**
   * 创建知识库
   * @param dto 创建知识库 DTO
   * @returns 知识库
   */
  create: (dto: CreateKnowledgeBaseDto) =>
    request<KnowledgeBaseVo>('/knowledge-bases', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  /**
   * 更新知识库
   * @param id 知识库 ID
   * @param dto 更新知识库 DTO
   */
  update: (dto: UpdateKnowledgeBaseDto) =>
    request<KnowledgeBaseVo>(`/knowledge-bases/${dto.id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    }),

  /**
   * 删除知识库（级联删除其文档与切片）
   * @param id 知识库 ID
   */
  delete: (id: string) =>
    request<void>(`/knowledge-bases/${id}`, { method: 'DELETE' }),

  /**
   * 获取知识库详情
   * @param id 知识库 ID
   * @returns 知识库
   */
  getById: (id: string) => request<KnowledgeBaseVo>(`/knowledge-bases/${id}`),
}
