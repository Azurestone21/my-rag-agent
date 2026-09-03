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
  ChunkProcessConfig,
} from '@my-rag-agent/shared';
import { Chunk } from '../../entities/chunk.entity.js';
import { Document } from '../../entities/document.entity.js';
import { EmbeddingsService } from '../embeddings/embeddings.service.js';

const DEFAULT_TEXT_SPLITTER = {
  chunkSize: 500,
  chunkOverlap: 50,
  separators: ['\n\n', '\n', '。', '！', '？', '，', ''],
};

const SEPARATOR_MAP: Record<string, string[]> = {
  newline: ['\n\n', '\n', ''],
  chinese_period: ['。', '\n\n', '\n', ''],
  chinese_exclaim: ['！', '\n\n', '\n', ''],
  english_period: ['. ', '\n\n', '\n', ''],
  english_exclaim: ['! ', '\n\n', '\n', ''],
  chinese_question: ['？', '\n\n', '\n', ''],
  english_question: ['? ', '\n\n', '\n', ''],
  paragraph: ['\n\n', ''],
};

/**
 * 解析自定义分段的分隔符：
 * - 命中预置 key（newline/chinese_period 等）用预置分隔符
 * - 其他任意字符串视为用户自定义分隔符原文（如 "；"），回车/空串作为回退
 */
function resolveTextSeparators(separator: string): string[] {
  if (!separator) return SEPARATOR_MAP.newline;
  const preset = SEPARATOR_MAP[separator];
  if (preset) return preset;
  return [separator, '\n', ''];
}

type TableConfig = { fileType: 'table'; headerRow: number; dataRow: number };

/**
 * 解析表格的表头行与数据起始行：
 * - headerRow：0 = 自动检测（跳过"非空列 < 3"的合并标题行）；N = 第 N 行（1 基）
 * - dataRow：0 = 从表头下一行开始；N = 第 N 行开始（1 基）
 */
function resolveTableRange(
  config: TableConfig,
  rawRows: unknown[][],
): { headerRowIndex: number; dataStartIndex: number } {
  if (config.headerRow === 0) {
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
    return { headerRowIndex, dataStartIndex: headerRowIndex + 1 };
  }
  const headerRowIndex = Math.max(0, config.headerRow - 1);
  const dataStartIndex =
    config.dataRow > 0
      ? Math.max(headerRowIndex + 1, config.dataRow - 1)
      : headerRowIndex + 1;
  return { headerRowIndex, dataStartIndex };
}

function resolveConfig(raw: Record<string, unknown> | null, ext: string): ChunkProcessConfig {
  if (raw) {
    return raw as unknown as ChunkProcessConfig;
  }
  const isTable = ext === '.xlsx' || ext === '.xls' || ext === '.csv';
  if (isTable) {
    // headerRow/dataRow 均为 0 表示自动检测
    return { fileType: 'table', headerRow: 0, dataRow: 0 };
  }
  return { fileType: 'text', splitMode: 'auto' };
}

function splitBySeparator(
  text: string,
  separators: string[],
  chunkSize: number,
): string[] {
  if (!text.trim()) return [];
  const primarySep = separators[0] ?? '\n';

  const rawSegments = primarySep
    ? text.split(primarySep).filter((s) => s.trim() !== '')
    : text.split('').filter((c) => c.trim() !== '');

  const result: string[] = [];
  const fallbackSeps = primarySep ? separators.slice(1) : [];
  for (const seg of rawSegments) {
    if (seg.length <= chunkSize) {
      result.push(seg.trim());
    } else if (fallbackSeps.length > 0) {
      const sub = splitBySeparator(seg, fallbackSeps, chunkSize);
      result.push(...sub);
    } else {
      for (let i = 0; i < seg.length; i += chunkSize) {
        result.push(seg.slice(i, i + chunkSize).trim());
      }
    }
  }
  return result;
}

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
      const ext = extname(document.filePath).toLowerCase();
      const config = resolveConfig(document.config, ext);

      const text = await this.extractText(document.filePath, config);

      let parts: string[];
      if (config.fileType === 'table') {
        parts = text
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line.length > 0);
      } else if (config.splitMode === 'auto') {
        const splitter = new RecursiveCharacterTextSplitter(DEFAULT_TEXT_SPLITTER);
        parts = await splitter.splitText(text);
      } else {
        const separators = resolveTextSeparators(config.separator);
        parts = splitBySeparator(text, separators, config.chunkSize);
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

  async findAll(
    documentId?: string,
    knowledgeBaseId?: string,
  ): Promise<ChunkDto[]> {
    if (knowledgeBaseId) {
      const entities = await this.chunks
        .createQueryBuilder('chunk')
        .innerJoin('chunk.document', 'doc')
        .where('doc.knowledgeBaseId = :kbId', { kbId: knowledgeBaseId })
        .andWhere(documentId ? 'chunk.documentId = :docId' : '1=1', {
          docId: documentId,
        })
        .orderBy('chunk.chunkIndex', 'ASC')
        .getMany();
      return entities.map((entity) => this.toDto(entity));
    }
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

  private async extractText(
    filePath: string,
    config?: ChunkProcessConfig,
  ): Promise<string> {
    const ext = extname(filePath).toLowerCase();
    if (ext === '.txt' || ext === '.md' || ext === '.csv') {
      if (ext === '.csv' && config?.fileType === 'table') {
        return this.parseCsvWithConfig(filePath, config);
      }
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

        // 表头/数据起始行解析：headerRow=0 自动检测（跳过"非空列<3"的合并标题行）
        const range = resolveTableRange(
          config?.fileType === 'table'
            ? config
            : { fileType: 'table', headerRow: 0, dataRow: 0 },
          rawRows,
        );
        const { headerRowIndex, dataStartIndex } = range;

        if (rawRows[headerRowIndex] === undefined) continue;
        const headers = rawRows[headerRowIndex].map((h) => String(h).trim());
        const validCols = headers
          .map((h, idx) => (h ? { name: h, idx } : null))
          .filter((c): c is { name: string; idx: number } => c !== null);

        if (validCols.length === 0) continue;

        for (let i = dataStartIndex; i < rawRows.length; i++) {
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
          if (Object.keys(obj).length >= 1) {
            lines.push(JSON.stringify(obj));
          }
        }
      }
      return lines.join('\n');
    }
    throw new Error(`不支持的文件类型: ${ext}`);
  }

  private async parseCsvWithConfig(
    filePath: string,
    config: { fileType: 'table'; headerRow: number; dataRow: number },
  ): Promise<string> {
    const content = await fs.readFile(filePath, 'utf-8');
    const rawRows = content
      .split(/\r?\n/)
      .map((line) => line.split(',').map((cell) => cell.trim()));

    const { headerRowIndex, dataStartIndex } = resolveTableRange(
      config,
      rawRows,
    );

    if (rawRows[headerRowIndex] === undefined) return '';
    const headers = rawRows[headerRowIndex].filter((h) => h.trim() !== '');
    if (headers.length === 0) return '';
    const lines: string[] = [];

    for (let i = dataStartIndex; i < rawRows.length; i++) {
      const row = rawRows[i];
      if (row.every((c) => c === '')) continue;
      const obj: Record<string, string> = {};
      headers.forEach((h, idx) => {
        const val = row[idx];
        if (val && val.trim() !== '') obj[h] = val.trim();
      });
      if (Object.keys(obj).length >= 1) {
        lines.push(JSON.stringify(obj));
      }
    }
    return lines.join('\n');
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
