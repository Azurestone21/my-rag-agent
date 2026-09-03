import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';
import type { Response } from 'express';
import type { SearchResultDto } from '@my-rag-agent/shared';
import { SearchService } from '../search/search.service.js';
import { ChatDto } from './dto/chat.dto.js';

const SYSTEM_PROMPT =
  '你是一个企业 RAG 知识库问答助手。请基于提供的知识片段回答用户问题，' +
  '并在回答中标注引用来源编号；如果知识片段不足以回答问题，请如实说明。请使用中文回答。';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly model: ChatOpenAI;
  private readonly modelName: string;

  constructor(
    config: ConfigService,
    private readonly search: SearchService,
  ) {
    this.modelName = config.get<string>('LLM_MODEL', 'qwen3.7-plus');
    this.model = new ChatOpenAI({
      model: this.modelName,
      apiKey: config.get<string>('BAILIAN_API_KEY'),
      temperature: 0.3,
      configuration: {
        baseURL: config.get<string>(
          'DASHSCOPE_BASE_URL',
          'https://dashscope.aliyuncs.com/compatible-mode/v1',
        ),
      },
    });
  }

  async stream(dto: ChatDto, res: Response): Promise<void> {
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const writeEvent = (event: string, data: unknown) => {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
      const flush = (res as Response & { flush?: () => void }).flush;
      if (typeof flush === 'function') {
        flush();
      }
    };

    writeEvent('metadata', {
      knowledgeBaseId: dto.knowledgeBaseId,
      query: dto.query,
      model: this.modelName,
    });

    try {
      const sources = await this.search.search(dto);
      writeEvent('sources', { sources });

      const prompt = this.buildPrompt(dto.query, sources);
      const stream = await this.model.stream([
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ]);

      let answer = '';
      for await (const chunk of stream) {
        const content =
          typeof chunk.content === 'string' ? chunk.content : '';
        if (!content) continue;
        answer += content;
        writeEvent('content', { content });
      }

      writeEvent('done', { answer, sourceCount: sources.length });
      res.end();
    } catch (error) {
      this.logger.error(error);
      writeEvent('error', {
        message: error instanceof Error ? error.message : '未知错误',
      });
      res.end();
    }
  }

  private buildPrompt(
    query: string,
    sources: SearchResultDto[],
  ): string {
    const context = sources
      .map(
        (source, index) =>
          `[${index + 1}] 来源: ${source.documentName}（相似度 ${source.similarity.toFixed(4)}）\n${source.content}`,
      )
      .join('\n\n');

    return [
      context ? `检索到的知识片段：\n${context}` : '未检索到相关知识片段。',
      '',
      `用户问题：${query}`,
    ].join('\n');
  }
}
