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
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('知识库')
@Controller('knowledge-bases')
export class KnowledgeBaseController {
  constructor(private readonly service: KnowledgeBaseService) {}

  @ApiOperation({ summary: '查询所有知识库' })
  @Get()
  findAll(): Promise<KnowledgeBaseDto[]> {
    return this.service.findAll();
  }

  @ApiOperation({ summary: '查询知识库详情' })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<KnowledgeBaseDto> {
    return this.service.findOne(id);
  }

  @ApiOperation({ summary: '创建知识库' })
  @Post()
  create(@Body() dto: CreateKnowledgeBaseDto): Promise<KnowledgeBaseDto> {
    return this.service.create(dto);
  }

  @ApiOperation({ summary: '更新知识库' })
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateKnowledgeBaseDto,
  ): Promise<KnowledgeBaseDto> {
    return this.service.update(id, dto);
  }

  @ApiOperation({ summary: '删除知识库' })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<boolean> {
    return this.service.remove(id);
  }
}
