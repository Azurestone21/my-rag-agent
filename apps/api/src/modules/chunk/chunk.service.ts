import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { promises as fs } from 'node:fs';
import { extname } from 'node:path';
import { Repository } from 'typeorm';
import XLSX from 'xlsx';
import type {
  ChunkDto,
  ChunkProcessResultDto,
} from '@my-rag-agent/shared';
import { Chunk } from '../../entities/chunk.entity.js';
import { Document } from '../../entities/document.entity.js';
import { EmbeddingsService } from '../embeddings/embeddings.service.js';

@Injectable()
export class ChunkService {
  constructor(
    @InjectRepository(Chunk)
    private readonly chunks: Repository<Chunk>,
    @InjectRepository(Document)
    private readonly documents: Repository<Document>,
    private readonly embeddings: EmbeddingsService,
  ) {}

  async process(documentId: string): Promise<ChunkProcessResultDto> {
    const document = await this.documents.findOneBy({ id: documentId });
    if (!document) {
      throw new NotFoundException(`文档 ${documentId} 不存在`);
    }

    document.status = 'processing';
    await this.documents.save(document);

    try {
      const text = await this.extractText(document.filePath);
      // 根据文件类型选择切片策略
      const ext = extname(document.filePath).toLowerCase();
      const isStructured = ext === '.xlsx' || ext === '.xls' || ext === '.csv';

      let parts: string[];
      if (isStructured) {
        // 结构化数据（Excel/CSV）：每行一条独立记录，直接按行切
        parts = text
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line.length > 0);
      } else {
        // 非结构化文本（txt/md）：固定长度 + 重叠切片，保证语义完整
        const splitter = new RecursiveCharacterTextSplitter({
          chunkSize: 500,
          chunkOverlap: 50,
          separators: ['\n\n', '\n', '。', '！', '？', '，', ''],
        });
        parts = await splitter.splitText(text);
      }

      await this.chunks.delete({ documentId });

      const entities = parts.map((part, index) =>
        this.chunks.create({
          documentId,
          content: part.trim(),
          charCount: part.trim().length,
          chunkIndex: index,
          embedding: null,
        }),
      );
      await this.chunks.save(entities);

      // 百炼 embedding 接口单次批量上限 20，超出需分批
      const vectors: number[][] = [];
      const BATCH_SIZE = 20;
      for (let i = 0; i < entities.length; i += BATCH_SIZE) {
        const batch = entities
          .slice(i, i + BATCH_SIZE)
          .map((entity) => entity.content);
        vectors.push(...(await this.embeddings.embedTexts(batch)));
      }
      entities.forEach((entity, index) => {
        entity.embedding = this.toVectorString(vectors[index]);
      });
      await this.chunks.save(entities);

      document.status = 'completed';
      document.chunkCount = entities.length;
      await this.documents.save(document);

      return { documentId, chunkCount: entities.length };
    } catch (error) {
      document.status = 'failed';
      await this.documents.save(document);
      throw error;
    }
  }

  async findAll(documentId?: string): Promise<ChunkDto[]> {
    const where = documentId ? { documentId } : {};
    const entities = await this.chunks.find({
      where,
      order: { chunkIndex: 'ASC' },
    });
    return entities.map((entity) => this.toDto(entity));
  }

  async findOne(id: string): Promise<ChunkDto> {
    const entity = await this.chunks.findOneBy({ id });
    if (!entity) {
      throw new NotFoundException(`切片 ${id} 不存在`);
    }
    return this.toDto(entity);
  }

  async create(documentId: string, content: string): Promise<ChunkDto> {
    const document = await this.documents.findOneBy({ id: documentId });
    if (!document) {
      throw new NotFoundException(`文档 ${documentId} 不存在`);
    }
    const maxIndex =
      (await this.chunks.maximum('chunkIndex', { documentId })) ?? -1;
    const entity = this.chunks.create({
      documentId,
      content,
      charCount: content.length,
      chunkIndex: maxIndex + 1,
      embedding: this.toVectorString(await this.embeddings.embedQuery(content)),
    });
    const saved = await this.chunks.save(entity);
    return this.toDto(saved);
  }

  async update(id: string, content: string): Promise<ChunkDto> {
    const entity = await this.chunks.findOneBy({ id });
    if (!entity) {
      throw new NotFoundException(`切片 ${id} 不存在`);
    }
    entity.content = content;
    entity.charCount = content.length;
    entity.embedding = this.toVectorString(await this.embeddings.embedQuery(content));
    const saved = await this.chunks.save(entity);
    return this.toDto(saved);
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.chunks.delete({ id });
    if (!result.affected) {
      throw new NotFoundException(`切片 ${id} 不存在`);
    }
    return true;
  }

  private async extractText(filePath: string): Promise<string> {
    const ext = extname(filePath).toLowerCase();
    if (ext === '.txt' || ext === '.md' || ext === '.csv') {
      return fs.readFile(filePath, 'utf-8');
    }
    // 纯文本类文件：直接读取原始内容，后续用 TextSplitter 切片
    if (ext === '.xlsx' || ext === '.xls') {
      const workbook = XLSX.readFile(filePath);
      const lines: string[] = [];
      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        // 先拿到原始二维数组（含所有行，包括可能的标题行）
        const rawRows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
          header: 1,
          defval: '',
        });

        // 自动检测真正的表头行：跳过 "只有少数非空单元格" 的标题行
        let headerRowIndex = 0;
        for (let i = 0; i < rawRows.length; i++) {
          const nonEmptyCount = rawRows[i].filter(
            (cell) => String(cell).trim() !== '',
          ).length;
          // 非空列 >= 3 认为是表头行（合并标题行通常只有 1 个非空单元格）
          if (nonEmptyCount >= 3) {
            headerRowIndex = i;
            break;
          }
        }

        const headers = rawRows[headerRowIndex].map((h) => String(h).trim());
        // 过滤掉表头为空的列
        const validCols = headers
          .map((h, idx) => (h ? { name: h, idx } : null))
          .filter((c): c is { name: string; idx: number } => c !== null);

        // 数据从表头下一行开始
        for (let i = headerRowIndex + 1; i < rawRows.length; i++) {
          const row = rawRows[i];
          const obj: Record<string, unknown> = {};
          for (const col of validCols) {
            let value = row[col.idx] ?? '';
            // 只有表头含"日期"的列，才把 Excel 序列号转 YYYY-MM-DD
            // 避免金额等大数字被误伤
            if (
              typeof value === 'number' &&
              /日期|时间|date/i.test(col.name) &&
              value >= 15000 &&
              value <= 80000
            ) {
              const epoch = new Date(Date.UTC(1899, 11, 30));
              const date = new Date(epoch.getTime() + value * 86400000);
              value = date.toISOString().slice(0, 10);
            }
            const strValue = String(value).trim();
            if (strValue !== '') {
              obj[col.name] = strValue;
            }
          }
          // 至少 2 个字段才输出（跳过空行）
          if (Object.keys(obj).length >= 2) {
            lines.push(JSON.stringify(obj));
          }
        }
      }
      return lines.join('\n');
    }
    throw new Error(`不支持的文件类型: ${ext}`);
  }

  private toDto(entity: Chunk): ChunkDto {
    return {
      id: entity.id,
      documentId: entity.documentId,
      index: entity.chunkIndex,
      content: entity.content,
      charCount: entity.charCount,
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  private toVectorString(vector: number[]): string {
    return `[${vector.join(',')}]`;
  }
}
