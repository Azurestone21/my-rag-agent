import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { unlink } from 'node:fs/promises';
import { KnowledgeBaseVo } from './vo/knowledge-base.vo.js';
import { Document } from '../../entities/document.entity.js';
import { KnowledgeBase } from '../../entities/knowledge-base.entity.js';
import { CreateKnowledgeBaseDto } from './dto/create-knowledge-base.dto.js';
import { UpdateKnowledgeBaseDto } from './dto/update-knowledge-base.dto.js';
import { WorkspaceService } from '../workspace/workspace.service.js';

@Injectable()
export class KnowledgeBaseService {
  constructor(
    @InjectRepository(KnowledgeBase)
    private readonly repository: Repository<KnowledgeBase>,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    private readonly workspaceService: WorkspaceService,
  ) {}

  async findAll(
    workspaceId: string,
    userId: number,
  ): Promise<KnowledgeBaseVo[]> {
    if (!userId) {
      throw new BadRequestException('用户 ID 不能为空');
    }

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
      .addSelect('kb.workspaceId', 'workspaceId')
      .where('kb.workspaceId = :workspaceId', { workspaceId })
      .groupBy('kb.id')
      .orderBy('kb.createdAt', 'DESC')
      .getRawMany<KnowledgeBaseVo>();

    return rows.map((row) => ({
      ...row,
      documentCount: Number(row.documentCount),
      chunkCount: Number(row.chunkCount),
    }));
  }

  async findOne(id: string, workspaceId: string): Promise<KnowledgeBaseVo> {
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
      .andWhere('kb.workspaceId = :workspaceId', { workspaceId })
      .groupBy('kb.id')
      .getRawOne<KnowledgeBaseVo>();

    if (!row) {
      throw new NotFoundException(`知识库 ${id} 不存在`);
    }

    return {
      ...row,
      documentCount: Number(row.documentCount),
      chunkCount: Number(row.chunkCount),
    };
  }

  async create(
    dto: CreateKnowledgeBaseDto,
    workspaceId: string,
  ): Promise<KnowledgeBaseVo> {
    const entity = this.repository.create({
      ...dto,
      workspaceId,
    });
    const saved = await this.repository.save(entity);
    return this.toDto(saved);
  }

  async update(
    id: string,
    dto: UpdateKnowledgeBaseDto,
    workspaceId: string,
  ): Promise<KnowledgeBaseVo> {
    const kb = await this.repository.findOneBy({ id, workspaceId });
    if (!kb) {
      throw new NotFoundException(`知识库 ${id} 不存在`);
    }
    Object.assign(kb, dto);
    const saved = await this.repository.save(kb);
    return this.toDto(saved);
  }

  async remove(id: string, workspaceId: string): Promise<boolean> {
    // 检查知识库是否存在且用户有权限删除
    const kb = await this.repository.findOneBy({ id, workspaceId });
    if (!kb) {
      throw new NotFoundException(`知识库不存在或无权访问`);
    }

    // 先查出所有关联文档的磁盘路径（级联删除后就拿不到了）
    const docs = await this.documentRepository.find({
      where: { knowledgeBaseId: id },
      select: { filePath: true },
    });
    const filePaths = docs.map((d) => d.filePath);

    // 级联删除数据库记录（kb → documents → chunks）
    const result = await this.repository.delete({ id, workspaceId });
    if (!result.affected) {
      throw new NotFoundException(`知识库 ${id} 不存在`);
    }

    // 清理磁盘文件（和 document.service.remove 保持一致）
    await Promise.allSettled(filePaths.map((p) => unlink(p)));
    return true;
  }

  private toDto(entity: KnowledgeBase): KnowledgeBaseVo {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description ?? '',
      documentCount: 0,
      chunkCount: 0,
      workspaceId: entity.workspaceId,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}
