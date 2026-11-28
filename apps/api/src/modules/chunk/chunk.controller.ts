import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import type { ChunkVo, ChunkProcessVo, PageVo } from '@my-rag-agent/shared';
import { ChunkService } from './chunk.service.js';
import { CreateChunkDto } from './dto/create-chunk.dto.js';
import { UpdateChunkDto } from './dto/update-chunk.dto.js';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChunkGetPageDto } from './dto/get-page.dto.js';
import { RequireWorkspace } from '../../decorators/RequireWorkspace.decorator.js';
import type { Request } from 'express';

@ApiTags('文档切片')
@Controller('chunks')
export class ChunkController {
  constructor(private readonly service: ChunkService) {}

  @ApiOperation({ summary: '将文档处理为切片列表' })
  @RequireWorkspace(true)
  @Post('process/:documentId')
  process(
    @Param('documentId', ParseUUIDPipe) documentId: string,
  ): Promise<ChunkProcessVo> {
    return this.service.process(documentId);
  }

  @ApiOperation({ summary: '使用文档ID或知识库ID查询切片' })
  @RequireWorkspace(true)
  @Post('page')
  @HttpCode(200)
  page(
    @Body() dto: ChunkGetPageDto,
    @Req() req: Request,
  ): Promise<PageVo<ChunkVo>> {
    return this.service.page(dto, req.workspaceId!);
  }

  @ApiOperation({ summary: '创建切片' })
  @RequireWorkspace(true)
  @Post('create')
  create(
    @Body() dto: CreateChunkDto,
    @Req() req: Request,
  ): Promise<ChunkVo> {
    return this.service.create(dto.documentId, dto.content, req.workspaceId!);
  }

  @ApiOperation({ summary: '查询切片' })
  @RequireWorkspace(true)
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<ChunkVo> {
    return this.service.findOne(id, req.workspaceId!);
  }

  @ApiOperation({ summary: '更新切片内容' })
  @RequireWorkspace(true)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateChunkDto,
    @Req() req: Request,
  ): Promise<ChunkVo> {
    return this.service.update(id, dto.content, req.workspaceId!);
  }

  @ApiOperation({ summary: '删除切片' })
  @RequireWorkspace(true)
  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<boolean> {
    return this.service.remove(id, req.workspaceId!);
  }
}
