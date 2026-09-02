import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'node:crypto';
import { Repository } from 'typeorm';
import type { ServiceCallDto } from '@my-rag-agent/shared';
import { ServiceCall } from '../../entities/service-call.entity.js';
import { CreateServiceCallDto } from './dto/create-service-call.dto.js';

@Injectable()
export class ServiceCallService {
  constructor(
    @InjectRepository(ServiceCall)
    private readonly repository: Repository<ServiceCall>,
  ) {}

  async create(dto: CreateServiceCallDto): Promise<ServiceCallDto> {
    const entity = this.repository.create({
      knowledgeBaseId: dto.knowledgeBaseId,
      name: dto.name,
      apiKey: `mk-${randomBytes(18).toString('base64url')}`,
      topK: dto.topK,
      similarityThreshold: 0,
      denseWeight: 0.5,
    });
    const saved = await this.repository.save(entity);
    return this.toDto(saved);
  }

  async findAll(): Promise<ServiceCallDto[]> {
    const entities = await this.repository.find({
      order: { createdAt: 'DESC' },
    });
    return entities.map((entity) => this.toDto(entity));
  }

  async findOne(id: string): Promise<ServiceCallDto> {
    const entity = await this.repository.findOneBy({ id });
    if (!entity) {
      throw new NotFoundException(`服务调用 ${id} 不存在`);
    }
    return this.toDto(entity);
  }

  async findEntityByApiKey(apiKey: string): Promise<ServiceCall | null> {
    return this.repository.findOneBy({ apiKey });
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.repository.delete({ id });
    if (!result.affected) {
      throw new NotFoundException(`服务调用 ${id} 不存在`);
    }
    return true;
  }

  private toDto(entity: ServiceCall): ServiceCallDto {
    return {
      id: entity.id,
      name: entity.name,
      topK: entity.topK,
      apiKey: entity.apiKey,
      createdAt: entity.createdAt.toISOString(),
    };
  }
}
