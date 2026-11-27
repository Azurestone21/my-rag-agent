import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { promises as fs } from 'node:fs';
import { extname, join } from 'node:path';
import { Repository } from 'typeorm';
import type { ChunkProcessConfig, PageVo } from '@my-rag-agent/shared';
import { DocumentVo } from './vo/document.vo.js';
import { Document } from '../../entities/document.entity.js';
import { ChunkService } from '../chunk/chunk.service.js';
import { DocumentGetPageDto } from './dto/document-get-page.dto.js';

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
    config?: ChunkProcessConfig,
  ): Promise<DocumentVo> {
    const entity = this.repository.create({
      knowledgeBaseId,
      name: decodeFileName(file.originalname),
      filePath: file.path,
      status: 1,
      importMethod: 1,
      strategy:
        config && 'splitMode' in config && config?.splitMode !== 'auto' ? 2 : 1,
      chunkCount: 0,
      config: (config ?? null) as Record<string, unknown> | null,
    });
    const saved = await this.repository.save(entity);
    // 异步处理切片
    void this.chunkService.process(saved.id).catch((error: Error) => {
      this.logger.error(`文档 ${saved.id} 自动切片失败: ${error.message}`);
    });
    return this.toDto(saved);
  }

  async cancel(id: string): Promise<boolean> {
    await this.chunkService.cancelProcess(id);
    return true;
  }

  async page(dto: DocumentGetPageDto): Promise<PageVo<DocumentVo>> {
    const { pageNum, pageSize, name, knowledgeBaseId } = dto;
    const qb = await this.repository
      .createQueryBuilder('document')
      .where('document.knowledgeBaseId = :knowledgeBaseId', {
        knowledgeBaseId,
      })
      .orderBy('document.createdAt', 'DESC')
      .skip((pageNum - 1) * pageSize)
      .take(pageSize);

    if (name) {
      qb.andWhere('document.name LIKE :name', {
        name: `%${name}%`,
      });
    }

    const [entities, total] = await qb.getManyAndCount();

    return {
      list: entities.map((entity) => this.toDto(entity)),
      total,
      havePrev: pageNum > 1,
      haveNext: total > pageNum * pageSize,
      pageNum,
      pageSize,
    };
  }

  async findOne(id: string): Promise<DocumentVo> {
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

  private toDto(entity: Document): DocumentVo {
    return {
      id: entity.id,
      knowledgeBaseId: entity.knowledgeBaseId,
      name: entity.name,
      status: entity.status,
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
