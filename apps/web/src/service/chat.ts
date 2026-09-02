import type { ChatAnswerDto } from "@my-rag-agent/shared";
import { request } from "./request";

export const chatApi = {
  /**
   * RAG 问答（JSON 返回答案 + 引用来源）
   * @param params.knowledgeBaseId 知识库 ID
   * @param params.query 用户问题
   * @param params.topK 检索返回数量
   * @param params.minSimilarity 最低相似度阈值
   * @param params.temperature 生成温度（默认 0.3）
   */
  run: (params: {
    knowledgeBaseId: string;
    query: string;
    topK: number;
    minSimilarity: number;
    temperature?: number;
  }) =>
    request<ChatAnswerDto>("/chat", {
      method: "POST",
      body: JSON.stringify(params),
    }),
};
