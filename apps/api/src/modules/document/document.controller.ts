import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
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
import type { ChunkProcessConfig, PageVo } from '@my-rag-agent/shared';
import { DocumentVo } from './vo/document.vo.js';
import { DocumentService } from './document.service.js';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DocumentGetPageDto } from './dto/document-get-page.dto.js';

@ApiTags('文档')
@Controller('documents')
export class DocumentController {
  constructor(private readonly service: DocumentService) {}

  @ApiOperation({ summary: '上传文档' })
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
          callback(
            null,
            `${unique}${extname(file.originalname).toLowerCase()}`,
          );
        },
      }),
      fileFilter: (_req, file, callback) => {
        const allowed = ['.csv', '.xlsx', '.xls', '.txt', '.md'];
        const ext = extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
          callback(null, true);
        } else {
          callback(
            new BadRequestException(
              '仅支持 .csv / .xlsx / .xls / .txt / .md 文件',
            ),
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
    @Query('config') configStr?: string,
  ): Promise<DocumentVo> {
    if (!file) {
      throw new BadRequestException('请上传文件');
    }
    if (!this.service.isExtensionAllowed(file.originalname)) {
      throw new BadRequestException(
        '仅支持 .csv / .xlsx / .xls / .txt / .md 文件',
      );
    }
    if (!knowledgeBaseId) {
      throw new BadRequestException('缺少 knowledgeBaseId');
    }
    let config: ChunkProcessConfig | undefined;
    if (configStr) {
      try {
        config = JSON.parse(configStr) as ChunkProcessConfig;
      } catch {
        throw new BadRequestException('config 参数不是合法 JSON');
      }
    }
    return this.service.create(knowledgeBaseId, file, config);
  }

  @ApiOperation({ summary: '取消上传文档' })
  @Post('cancel/:id')
  cancel(@Param('id', ParseUUIDPipe) id: string): Promise<boolean> {
    return this.service.cancel(id);
  }

  @ApiOperation({ summary: '查询所有文档' })
  @Post('page')
  @HttpCode(200)
  page(
    @Body() dto: DocumentGetPageDto,
  ): Promise<PageVo<DocumentVo>> {
    return this.service.page(dto);
  }

  @ApiOperation({ summary: '查询文档详情' })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<DocumentVo> {
    return this.service.findOne(id);
  }

  @ApiOperation({ summary: '删除文档' })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<boolean> {
    return this.service.remove(id);
  }
}
