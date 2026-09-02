import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Post,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import type { ServiceCallDto } from '@my-rag-agent/shared';
import { ChatDto } from '../chat/dto/chat.dto.js';
import { ChatService } from '../chat/chat.service.js';
import { CreateServiceCallDto } from './dto/create-service-call.dto.js';
import { StreamMessageDto } from './dto/stream-message.dto.js';
import { ServiceCallService } from './service-call.service.js';

@Controller('service-calls')
export class ServiceCallController {
  constructor(
    private readonly service: ServiceCallService,
    private readonly chat: ChatService,
  ) {}

  @Post()
  create(@Body() dto: CreateServiceCallDto): Promise<ServiceCallDto> {
    return this.service.create(dto);
  }

  @Get()
  findAll(): Promise<ServiceCallDto[]> {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ServiceCallDto> {
    return this.service.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<boolean> {
    return this.service.remove(id);
  }

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
