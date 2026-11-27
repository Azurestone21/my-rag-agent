import type { SearchVo as SearchVoShared } from '@my-rag-agent/shared';
import { ApiProperty } from '@nestjs/swagger';

export class SearchVo implements SearchVoShared {
  @ApiProperty({ description: '切片ID' })
  chunkId: string;

  @ApiProperty({ description: '文档名称' })
  documentName: string;

  @ApiProperty({ description: '切片内容' })
  content: string;

  @ApiProperty({ description: '相似度' })
  similarity: number;
}