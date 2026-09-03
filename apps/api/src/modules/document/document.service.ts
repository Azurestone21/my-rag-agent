import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { promises as fs } from 'node:fs';
import { extname, join } from 'node:path';
import { Repository } from 'typeorm';
import type { DocumentDto, DocumentStatus } from '@my-rag-agent/shared';
import { Document } from '../../entities/document.entity.js';
import { ChunkService } from '../chunk/chunk.service.js';

const ALLOWED_EXTENSIONS = ['.csv', '.xlsx', '.xls', '.txt', '.md'];

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);

  constructor(
    @InjectRepository(Document)
    private readonly repository: Repository<Document>,
    private readonly config: ConfigService,
    private readonly chunkService: ChunkService,
  ) {}

  getUploadDir(): string {
    return this.config.get<string>('UPLOAD_DIR') ?? 'uploads';
  }

  isExtensionAllowed(filename: string): boolean {
    return ALLOWED_EXTENSIONS.includes(extname(filename).toLowerCase());
  }

  async create(
    knowledgeBaseId: string,
    file: Express.Multer.File,
  ): Promise<DocumentDto> {
    const entity = this.repository.create({
      knowledgeBaseId,
      name: decodeFileName(file.originalname),
      filePath: file.path,
      status: 'pending' as DocumentStatus,
      importMethod: 'local_upload',
      strategy: 'my_rag_agent_init_version',
      chunkCount: 0,
    });
    const saved = await this.repository.save(entity);
    void this.chunkService.process(saved.id).catch((error: Error) => {
      this.logger.error(`文档 ${saved.id} 自动切片失败: ${error.message}`);
    });
    return this.toDto(saved);
  }

  async findAll(knowledgeBaseId?: string): Promise<DocumentDto[]> {
    const where = knowledgeBaseId ? { knowledgeBaseId } : {};
    const entities = await this.repository.find({
      where,
      order: { createdAt: 'DESC' },
    });
    return entities.map((entity) => this.toDto(entity));
  }

  async findOne(id: string): Promise<DocumentDto> {
    const entity = await this.repository.findOneBy({ id });
    if (!entity) {
      throw new NotFoundException(`文档 ${id} 不存在`);
    }
    return this.toDto(entity);
  }

  async remove(id: string): Promise<boolean> {
    const entity = await this.repository.findOneBy({ id });
    if (!entity) {
      throw new NotFoundException(`文档 ${id} 不存在`);
    }
    await this.repository.delete({ id });
    await fs.unlink(entity.filePath).catch(() => undefined);
    return true;
  }

  private toDto(entity: Document): DocumentDto {
    return {
      id: entity.id,
      knowledgeBaseId: entity.knowledgeBaseId,
      name: entity.name,
      status: entity.status as DocumentStatus,
      strategy: entity.strategy,
      chunkCount: entity.chunkCount,
      importMethod: entity.importMethod,
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}

/**
 * 修复 Multer 以 latin1 解码导致的中文文件名乱码：
 * 若字符串可被 latin1 -> utf8 正确还原则还原，否则保留原值。
 */
export function decodeFileName(name: string): string {
  if (!/[\u0080-\u00ff]/.test(name)) return name;
  const fixed = Buffer.from(name, 'latin1').toString('utf8');
  return fixed.includes('\uFFFD') ? name : fixed;
}
