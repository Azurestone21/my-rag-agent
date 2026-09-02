import type { SearchResultDto } from "@my-rag-agent/shared";
import { request, toQuery } from "./request";

export const searchApi = {
  /**
   * 向量相似度检索
   * @param params.knowledgeBaseId 知识库 ID
   * @param params.query 查询语句
   * @param params.topK 返回结果数量
   * @param params.minSimilarity 最低相似度阈值
   */
  run: (params: {
    knowledgeBaseId: string;
    query: string;
    topK: number;
    minSimilarity: number;
  }) => request<SearchResultDto[]>(`/search${toQuery(params)}`),
};
