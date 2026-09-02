import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAIEmbeddings } from '@langchain/openai';

@Injectable()
export class EmbeddingsService {
  private readonly embeddings: OpenAIEmbeddings;

  constructor(config: ConfigService) {
    this.embeddings = new OpenAIEmbeddings({
      model: config.get<string>('EMBEDDING_MODEL', 'qwen3.7-text-embedding'),
      apiKey: config.get<string>('BAILIAN_API_KEY'),
      configuration: {
        baseURL: config.get<string>(
          'DASHSCOPE_BASE_URL',
          'https://dashscope.aliyuncs.com/compatible-mode/v1',
        ),
      },
    });
  }

  async embedQuery(text: string): Promise<number[]> {
    return this.embeddings.embedQuery(text);
  }

  async embedTexts(texts: string[]): Promise<number[][]> {
    return this.embeddings.embedDocuments(texts);
  }
}
