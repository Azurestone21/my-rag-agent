import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAIEmbeddings } from '@langchain/openai';

@Injectable()
export class EmbeddingsService {
  private readonly embeddings: OpenAIEmbeddings;

  constructor(config: ConfigService) {
    this.embeddings = new OpenAIEmbeddings({
      model: config.get<string>('LLM_EMBEDDING_MODEL', 'qwen3.7-text-embedding'),
      apiKey: config.get<string>('LLM_API_KEY'),
      configuration: {
        baseURL: config.get<string>(
          'LLM_BASE_URL',
          'https://dashscope.aliyuncs.com/compatible-mode/v1',
        ),
      },
    });
  }

  /**
   * 将单段文本（通常是用户搜索词）转为向量，用于知识检索时计算相似度
   * @param text 用户查询文本，如 "张三"
   * @returns 1024 维浮点数组
   */
  async embedQuery(text: string): Promise<number[]> {
    return this.embeddings.embedQuery(text);
  }

  /**
   * 批量将多段文本（通常是文档切片）转为向量，用于入库
   * @param texts 切片文本数组，如 ["张三 深圳南山店...", "李四 广州天河店..."]
   * @returns 每个元素对应一段文本的 1024 维向量
   */
  async embedTexts(texts: string[]): Promise<number[][]> {
    return this.embeddings.embedDocuments(texts);
  }
}
