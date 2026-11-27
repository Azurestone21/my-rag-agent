import type { DocumentVo as DocumentVoShared } from '@my-rag-agent/shared';
import { ApiProperty } from '@nestjs/swagger';

export class DocumentVo implements DocumentVoShared {
  @ApiProperty({ description: '文档ID' })
  id: string;

  @ApiProperty({ description: '知识库ID' })
  knowledgeBaseId: string;

  @ApiProperty({ description: '文档名称' })
  name: string;

  @ApiProperty({ description: '文档状态' })
  status: number;

  @ApiProperty({ description: '文档导入策略' })
  strategy: number;

  @ApiProperty({ description: '文档分块数量' })
  chunkCount: number;

  @ApiProperty({ description: '文档导入方法' })
  importMethod: number;

  @ApiProperty({ description: '文档更新时间' })
  updatedAt: string;
}
