import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import type { ServiceCallDto } from '@my-rag-agent/shared';
import { ChatDto } from '../chat/dto/chat.dto.js';
import { ChatService } from '../chat/chat.service.js';
import { CreateServiceCallDto } from './dto/create-service-call.dto.js';
import { StreamMessageDto } from './dto/stream-message.dto.js';
import { ServiceCallService } from './service-call.service.js';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('服务调用')
@Controller('service-calls')
export class ServiceCallController {
  constructor(
    private readonly service: ServiceCallService,
    private readonly chat: ChatService,
  ) {}

  @ApiOperation({ summary: '创建服务调用' })
  @Post()
  create(@Body() dto: CreateServiceCallDto): Promise<ServiceCallDto> {
    return this.service.create(dto);
  }

  @ApiOperation({ summary: '获取所有服务调用' })
  @Get()
  findAll(
    @Query('knowledgeBaseId') knowledgeBaseId?: string,
  ): Promise<ServiceCallDto[]> {
    return this.service.findAll(knowledgeBaseId);
  }

  @ApiOperation({ summary: '获取服务调用详情' })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ServiceCallDto> {
    return this.service.findOne(id);
  }

  @ApiOperation({ summary: '删除服务调用' })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<boolean> {
    return this.service.remove(id);
  }

  @ApiOperation({ summary: '服务调用流' })
  @Post(':id/chat/stream')
  async stream(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('authorization') authorization: string | undefined,
    @Body() body: StreamMessageDto,
    @Res() res: Response,
  ): Promise<void> {
    const serviceCall = await this.service.findEntityByApiKey(
      authorization?.replace(/^Bearer\s+/i, '') ?? '',
    );
    if (!serviceCall || serviceCall.id !== id) {
      res.status(401).json({ message: '无效的 API Key' });
      return;
    }

    const dto = new ChatDto();
    dto.knowledgeBaseId = serviceCall.knowledgeBaseId;
    dto.query = body.message;
    dto.topK = serviceCall.topK;
    await this.chat.stream(dto, res);
  }
}
