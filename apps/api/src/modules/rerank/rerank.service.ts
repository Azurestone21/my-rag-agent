import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface RerankResult {
  index: number;
  relevance_score: number;
}

interface RerankResponse {
  results: RerankResult[];
}

@Injectable()
export class RerankService {
  private readonly logger = new Logger(RerankService.name);
  private readonly baseURL: string;
  private readonly apiKey: string;

  constructor(config: ConfigService) {
    // 核心改动：直接读取完整 Base URL
    this.baseURL =
      config.get<string>('LLM_RERANK_BASE_URL') ??
      config.get<string>('LLM_BASE_URL') ?? '';
    if (!this.baseURL) {
      throw new Error('LLM_RERANK_BASE_URL is not defined');
    }
    // 移除尾部斜杠以便安全拼接
    this.baseURL = this.baseURL.replace(/\/+$/, '');

    this.apiKey = config.get<string>('LLM_API_KEY') ?? '';
    if (!this.apiKey) {
      throw new Error('LLM_API_KEY is not defined');
    }
  }

  async rerank(
    query: string,
    documents: string[],
    model: string,
    topN?: number,
  ): Promise<RerankResult[]> {
    if (!documents.length) return [];

    const url = `${this.baseURL}/reranks`;
    const body = {
      model,
      query,
      documents: documents.map((d) => d.slice(0, 6000)),
      top_n: Math.min(topN ?? 10, documents.length),
    };

    this.logger.log('Rerank: model=' + model + ' docs=' + documents.length);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + this.apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      this.logger.error('Rerank API error: ' + res.status + ' ' + text);
      throw new Error('Rerank API error: ' + res.status);
    }

    const data = (await res.json()) as RerankResponse;
    this.logger.log('Rerank: data=' + JSON.stringify(data));
    if (!data.results || !Array.isArray(data.results)) {
      throw new Error('Unexpected rerank response structure');
    }
    return data.results;
  }
}
