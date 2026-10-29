import type { DocumentDto, ChunkProcessConfig } from '@my-rag-agent/shared'
import { request, toQuery } from './request'

export const documentApi = {
  /**
   * 获取文档列表，可按知识库过滤
   * @param knowledgeBaseId 知识库 ID
   */
  list: (knowledgeBaseId?: string) =>
    request<DocumentDto[]>(`/documents${toQuery({ knowledgeBaseId })}`),
  /**
   * 上传文档（multipart），仅支持 .csv/.xlsx/.xls
   * @param knowledgeBaseId 所属知识库
   * @param file 文件
   * @param config 可选的文件处理配置（分段策略/表头行等）
   */
  upload: (
    knowledgeBaseId: string,
    file: File,
    config?: ChunkProcessConfig,
  ) => {
    const form = new FormData()
    form.append('file', file)
    const query: Record<string, string> = { knowledgeBaseId }
    if (config) {
      query.config = JSON.stringify(config)
    }
    return request<DocumentDto>(`/documents/upload${toQuery(query)}`, {
      method: 'POST',
      body: form,
    })
  },
  /**
   * 获取单个文档详情
   * @param id 文档 ID
   */
  get: (id: string) => request<DocumentDto>(`/documents/${id}`),
  delete: (id: string) =>
    request<void>(`/documents/${id}`, { method: 'DELETE' }),
}
