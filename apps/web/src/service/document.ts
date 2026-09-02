import type { DocumentDto } from "@my-rag-agent/shared";
import { request, toQuery } from "./request";

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
   */
  upload: (knowledgeBaseId: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<DocumentDto>(
      `/documents/upload${toQuery({ knowledgeBaseId })}`,
      { method: "POST", body: form },
    );
  },
  /**
   * 删除文档（同时删除磁盘文件与切片）
   * @param id 文档 ID
   */
  delete: (id: string) =>
    request<void>(`/documents/${id}`, { method: "DELETE" }),
};
