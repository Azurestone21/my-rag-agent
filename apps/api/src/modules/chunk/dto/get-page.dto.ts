import { ApiProperty } from '@nestjs/swagger';
import { ChunkGetPageDto as SharedChunkGetPageDtoType } from '@my-rag-agent/shared';
import { CommonPageDto } from '../../../dto/commonPage.dto.js';
import { IsOptional, IsString } from 'class-validator';

export class ChunkGetPageDto
  extends CommonPageDto
  implements SharedChunkGetPageDtoType
{
  @ApiProperty({ description: '文档ID' })
  @IsOptional()
  @IsString()
  documentId?: string;

  @ApiProperty({ description: '知识库ID' })
  @IsOptional()
  @IsString()
  knowledgeBaseId?: string;

  @ApiProperty({ description: '查询关键词' })
  @IsOptional()
  @IsString()
  keyword?: string;
}
