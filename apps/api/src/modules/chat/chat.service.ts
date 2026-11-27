import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';
import type { Response } from 'express';
import { SearchService } from '../search/search.service.js';
import { ChatDto } from './dto/chat.dto.js';
import { SearchVo } from '../search/vo/search.vo.js';

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
    this.modelName = config.get<string>('LLM_CHAT_MODEL', 'qwen3.7-plus');
    this.model = new ChatOpenAI({
      model: this.modelName, // 模型
      apiKey: config.get<string>('LLM_API_KEY'), // API 密钥
      temperature: 0.3, // 温度，控制输出的随机性
      configuration: {
        baseURL: config.get<string>(
          'LLM_BASE_URL',
          'https://dashscope.aliyuncs.com/compatible-mode/v1',
        ),
      }, // 配置
    });
  }

  async stream(dto: ChatDto, res: Response): Promise<void> {
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8'); // 事件流
    res.setHeader('Cache-Control', 'no-cache, no-transform'); // 禁用缓存
    res.setHeader('Connection', 'keep-alive'); // 保持连接
    res.setHeader('X-Accel-Buffering', 'no'); // 强制 Nginx 不缓冲，确保消息及时发送
    res.flushHeaders(); // 刷新头信息

    // 写入事件
    const writeEvent = (event: string, data: unknown) => {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
      const flush = (res as Response & { flush?: () => void }).flush; // 刷新缓冲区
      if (typeof flush === 'function') {
        flush();
      }
    };

    // 写入元数据
    writeEvent('metadata', {
      knowledgeBaseId: dto.knowledgeBaseId,
      query: dto.query,
      model: this.modelName,
    });

    try {
      const sources = await this.search.search(dto); // 搜索知识片段
      writeEvent('sources', { sources }); // 写入检索到的知识片段，作为参考来源

      // 构建 prompt，把找出来的参考文档 (sources) 和用户的问题 (query) 拼装成一段长长的提示词。
      const prompt = this.buildPrompt(dto.query, sources);
      // 调用模型，传入 prompt 和系统提示，获取流式输出。
      const stream = await this.model.stream([
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ]); // 流式输出

      let answer = '';
      for await (const chunk of stream) {
        const content = typeof chunk.content === 'string' ? chunk.content : '';
        if (!content) continue;
        answer += content;
        writeEvent('content', { content }); // 每收到一个字，就推给前端
      }

      writeEvent('done', { answer, sourceCount: sources.length });
      res.end(); // 结束响应
    } catch (error) {
      this.logger.error(error);
      writeEvent('error', {
        message: error instanceof Error ? error.message : '未知错误',
      });
      res.end();
    }
  }

  private buildPrompt(query: string, sources: SearchVo[]): string {
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
