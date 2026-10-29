import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import type { ChunkDto, ChunkProcessResultDto } from '@my-rag-agent/shared';
import { ChunkService } from './chunk.service.js';
import { CreateChunkDto } from './dto/create-chunk.dto.js';
import { UpdateChunkDto } from './dto/update-chunk.dto.js';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('文档切片')
@Controller('chunks')
export class ChunkController {
  constructor(private readonly service: ChunkService) {}

  @ApiOperation({ summary: '将文档处理为切片列表' })
  @Post('process/:documentId')
  process(
    @Param('documentId', ParseUUIDPipe) documentId: string,
  ): Promise<ChunkProcessResultDto> {
    return this.service.process(documentId);
  }

  @ApiOperation({ summary: '使用文档ID或知识库ID查询切片' })
  @Get()
  findAll(
    @Query('documentId') documentId?: string,
    @Query('knowledgeBaseId') knowledgeBaseId?: string,
  ): Promise<ChunkDto[]> {
    return this.service.findAll(documentId, knowledgeBaseId);
  }

  @ApiOperation({ summary: '创建切片' })
  @Post()
  create(@Body() dto: CreateChunkDto): Promise<ChunkDto> {
    return this.service.create(dto.documentId, dto.content);
  }

  @ApiOperation({ summary: '查询切片' })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ChunkDto> {
    return this.service.findOne(id);
  }

  @ApiOperation({ summary: '更新切片内容' })
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateChunkDto,
  ): Promise<ChunkDto> {
    return this.service.update(id, dto.content);
  }

  @ApiOperation({ summary: '删除切片' })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<boolean> {
    return this.service.remove(id);
  }
}
