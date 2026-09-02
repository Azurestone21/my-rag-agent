import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { unlink } from 'node:fs/promises';
import type { KnowledgeBaseDto } from '@my-rag-agent/shared';
import { Document } from '../../entities/document.entity.js';
import { KnowledgeBase } from '../../entities/knowledge-base.entity.js';
import { CreateKnowledgeBaseDto } from './dto/create-knowledge-base.dto.js';
import { UpdateKnowledgeBaseDto } from './dto/update-knowledge-base.dto.js';

@Injectable()
export class KnowledgeBaseService {
  constructor(
    @InjectRepository(KnowledgeBase)
    private readonly repository: Repository<KnowledgeBase>,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
  ) {}

  async findAll(): Promise<KnowledgeBaseDto[]> {
    const rows = await this.repository
      .createQueryBuilder('kb')
      .leftJoin('documents', 'doc', 'doc.knowledge_base_id = kb.id')
      .leftJoin('chunks', 'chunk', 'chunk.document_id = doc.id')
      .select('kb.id', 'id')
      .addSelect('kb.name', 'name')
      .addSelect('kb.description', 'description')
      .addSelect('kb.createdAt', 'createdAt')
      .addSelect('kb.updatedAt', 'updatedAt')
      .addSelect('COUNT(DISTINCT doc.id)', 'documentCount')
      .addSelect('COUNT(DISTINCT chunk.id)', 'chunkCount')
      .groupBy('kb.id')
      .orderBy('kb.createdAt', 'DESC')
      .getRawMany<KnowledgeBaseDto>();

    return rows.map((row) => ({
      ...row,
      documentCount: Number(row.documentCount),
      chunkCount: Number(row.chunkCount),
    }));
  }

  async findOne(id: string): Promise<KnowledgeBaseDto> {
    const row = await this.repository
      .createQueryBuilder('kb')
      .leftJoin('documents', 'doc', 'doc.knowledge_base_id = kb.id')
      .leftJoin('chunks', 'chunk', 'chunk.document_id = doc.id')
      .select('kb.id', 'id')
      .addSelect('kb.name', 'name')
      .addSelect('kb.description', 'description')
      .addSelect('kb.createdAt', 'createdAt')
      .addSelect('kb.updatedAt', 'updatedAt')
      .addSelect('COUNT(DISTINCT doc.id)', 'documentCount')
      .addSelect('COUNT(DISTINCT chunk.id)', 'chunkCount')
      .where('kb.id = :id', { id })
      .groupBy('kb.id')
      .getRawOne<KnowledgeBaseDto>();

    if (!row) {
      throw new NotFoundException(`知识库 ${id} 不存在`);
    }

    return {
      ...row,
      documentCount: Number(row.documentCount),
      chunkCount: Number(row.chunkCount),
    };
  }

  async create(dto: CreateKnowledgeBaseDto): Promise<KnowledgeBaseDto> {
    const entity = this.repository.create(dto);
    const saved = await this.repository.save(entity);
    return this.toDto(saved);
  }

  async update(id: string, dto: UpdateKnowledgeBaseDto): Promise<KnowledgeBaseDto> {
    const entity = await this.repository.findOneBy({ id });
    if (!entity) {
      throw new NotFoundException(`知识库 ${id} 不存在`);
    }
    Object.assign(entity, dto);
    const saved = await this.repository.save(entity);
    return this.toDto(saved);
  }

  async remove(id: string): Promise<boolean> {
    // ① 先查出所有关联文档的磁盘路径（级联删除后就拿不到了）
    const docs = await this.documentRepository.find({
      where: { knowledgeBaseId: id },
      select: { filePath: true },
    });
    const filePaths = docs.map((d) => d.filePath);

    // ② 级联删除数据库记录（kb → documents → chunks）
    const result = await this.repository.delete({ id });
    if (!result.affected) {
      throw new NotFoundException(`知识库 ${id} 不存在`);
    }

    // ③ 清理磁盘文件（和 document.service.remove 保持一致）
    await Promise.allSettled(filePaths.map((p) => unlink(p)));
    return true;
  }

  private toDto(entity: KnowledgeBase): KnowledgeBaseDto {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description ?? '',
      documentCount: 0,
      chunkCount: 0,
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}
