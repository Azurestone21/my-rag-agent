import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import type { KnowledgeBaseDto } from '@my-rag-agent/shared';
import { CreateKnowledgeBaseDto } from './dto/create-knowledge-base.dto.js';
import { UpdateKnowledgeBaseDto } from './dto/update-knowledge-base.dto.js';
import { KnowledgeBaseService } from './knowledge-base.service.js';

@Controller('knowledge-bases')
export class KnowledgeBaseController {
  constructor(private readonly service: KnowledgeBaseService) {}

  @Get()
  findAll(): Promise<KnowledgeBaseDto[]> {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<KnowledgeBaseDto> {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateKnowledgeBaseDto): Promise<KnowledgeBaseDto> {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateKnowledgeBaseDto,
  ): Promise<KnowledgeBaseDto> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<boolean> {
    return this.service.remove(id);
  }
}
