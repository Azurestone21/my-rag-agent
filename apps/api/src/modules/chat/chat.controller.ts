import { Body, Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ChatService } from './chat.service.js';
import { ChatDto } from './dto/chat.dto.js';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('知识问答')
@Controller('chat')
export class ChatController {
  constructor(private readonly service: ChatService) {}

  @ApiOperation({ summary: '知识问答流式响应' })
  @Post('stream')
  stream(@Body() dto: ChatDto, @Res() res: Response): void {
    void this.service.stream(dto, res);
  }
}
