import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { KnowledgeBaseVo } from './vo/knowledge-base.vo.js';
import { CreateKnowledgeBaseDto } from './dto/create-knowledge-base.dto.js';
import { UpdateKnowledgeBaseDto } from './dto/update-knowledge-base.dto.js';
import { KnowledgeBaseService } from './knowledge-base.service.js';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequireWorkspace } from '../../decorators/RequireWorkspace.decorator.js';

@ApiTags('知识库')
@Controller('knowledge-bases')
export class KnowledgeBaseController {
  constructor(private readonly service: KnowledgeBaseService) {}

  @ApiOperation({ summary: '查询所有知识库' })
  @RequireWorkspace(true)
  @Get()
  findAll(@Req() req: any): Promise<KnowledgeBaseVo[]> {
    return this.service.findAll(req.workspaceId, req.user.userId);
  }

  @ApiOperation({ summary: '查询知识库详情' })
  @RequireWorkspace(true)
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any,
  ): Promise<KnowledgeBaseVo> {
    return this.service.findOne(id, req.workspaceId);
  }

  @ApiOperation({ summary: '创建知识库' })
  @RequireWorkspace(true)
  @Post()
  create(
    @Body() dto: CreateKnowledgeBaseDto,
    @Req() req: any,
  ): Promise<KnowledgeBaseVo> {
    return this.service.create(dto, req.workspaceId);
  }

  @ApiOperation({ summary: '更新知识库' })
  @RequireWorkspace(true)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any,
    @Body() dto: UpdateKnowledgeBaseDto,
  ): Promise<KnowledgeBaseVo> {
    return this.service.update(id, dto, req.workspaceId);
  }

  @ApiOperation({ summary: '删除知识库' })
  @RequireWorkspace(true)
  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any,
  ): Promise<boolean> {
    return this.service.remove(id, req.workspaceId);
  }
}
