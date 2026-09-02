import { Body, Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import type { ChatAnswerDto } from '@my-rag-agent/shared';
import { ChatService } from './chat.service.js';
import { ChatDto } from './dto/chat.dto.js';

@Controller('chat')
export class ChatController {
  constructor(private readonly service: ChatService) {}

  @Post()
  answer(@Body() dto: ChatDto): Promise<ChatAnswerDto> {
    return this.service.answer(dto);
  }

  @Post('stream')
  stream(@Body() dto: ChatDto, @Res() res: Response): void {
    void this.service.stream(dto, res);
  }
}
