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
import type {
  ChunkDto,
  ChunkProcessResultDto,
} from '@my-rag-agent/shared';
import { ChunkService } from './chunk.service.js';
import { CreateChunkDto } from './dto/create-chunk.dto.js';
import { UpdateChunkDto } from './dto/update-chunk.dto.js';

@Controller('chunks')
export class ChunkController {
  constructor(private readonly service: ChunkService) {}

  @Post('process/:documentId')
  process(
    @Param('documentId', ParseUUIDPipe) documentId: string,
  ): Promise<ChunkProcessResultDto> {
    return this.service.process(documentId);
  }

  @Get()
  findAll(
    @Query('documentId') documentId?: string,
    @Query('knowledgeBaseId') knowledgeBaseId?: string,
  ): Promise<ChunkDto[]> {
    return this.service.findAll(documentId, knowledgeBaseId);
  }

  @Post()
  create(@Body() dto: CreateChunkDto): Promise<ChunkDto> {
    return this.service.create(dto.documentId, dto.content);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ChunkDto> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateChunkDto,
  ): Promise<ChunkDto> {
    return this.service.update(id, dto.content);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<boolean> {
    return this.service.remove(id);
  }
}
