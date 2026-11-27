import { ApiProperty } from '@nestjs/swagger';
import { ChunkGetPageDto as SharedChunkGetPageDtoType } from '@my-rag-agent/shared';
import { CommonPageDto } from '../../../dto/commonPage.dto.js';

export class ChunkGetPageDto
  extends CommonPageDto
  implements SharedChunkGetPageDtoType
{
  @ApiProperty({ description: '文档ID' })
  documentId?: string;

  @ApiProperty({ description: '知识库ID' })
  knowledgeBaseId?: string;

  @ApiProperty({ description: '查询关键词' })
  keyword?: string;
}
