import { Body, Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ChatService } from './chat.service.js';
import { ChatDto } from './dto/chat.dto.js';

@Controller('chat')
export class ChatController {
  constructor(private readonly service: ChatService) {}

  @Post('stream')
  stream(@Body() dto: ChatDto, @Res() res: Response): void {
    void this.service.stream(dto, res);
  }
}
