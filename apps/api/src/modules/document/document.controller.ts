import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import type { DocumentDto } from '@my-rag-agent/shared';
import { DocumentService } from './document.service.js';

@Controller('documents')
export class DocumentController {
  constructor(private readonly service: DocumentService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, callback) => {
          const dir = join(process.cwd(), '..', '..', 'uploads');
          mkdirSync(dir, { recursive: true });
          callback(null, dir);
        },
        filename: (_req, file, callback) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          callback(null, `${unique}${extname(file.originalname).toLowerCase()}`);
        },
      }),
      fileFilter: (_req, file, callback) => {
        const allowed = ['.csv', '.xlsx', '.xls', '.txt', '.md'];
        const ext = extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
          callback(null, true);
        } else {
          callback(
            new BadRequestException('仅支持 .csv / .xlsx / .xls / .txt / .md 文件'),
            false,
          );
        }
      },
      limits: { fileSize: 20 * 1024 * 1024 },
    }),
  )
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Query('knowledgeBaseId') knowledgeBaseId: string,
  ): Promise<DocumentDto> {
    if (!file) {
      throw new BadRequestException('请上传文件');
    }
    if (!this.service.isExtensionAllowed(file.originalname)) {
      throw new BadRequestException('仅支持 .csv / .xlsx / .xls / .txt / .md 文件');
    }
    if (!knowledgeBaseId) {
      throw new BadRequestException('缺少 knowledgeBaseId');
    }
    return this.service.create(knowledgeBaseId, file);
  }

  @Get()
  findAll(
    @Query('knowledgeBaseId') knowledgeBaseId?: string,
  ): Promise<DocumentDto[]> {
    return this.service.findAll(knowledgeBaseId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<DocumentDto> {
    return this.service.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<boolean> {
    return this.service.remove(id);
  }
}
