import type { KnowledgeBaseVo as KnowledgeBaseVoShared } from '@my-rag-agent/shared';
import { ApiProperty } from '@nestjs/swagger';

export class KnowledgeBaseVo implements KnowledgeBaseVoShared {
  @ApiProperty({ description: '知识库 ID' })
  id: string;
  
  @ApiProperty({ description: '知识库名称' })
  name: string;

  @ApiProperty({ description: '知识库描述' })
  description: string;

  @ApiProperty({ description: '文档数量' })
  documentCount: number;

  @ApiProperty({ description: '分块数量' })
  chunkCount: number;

  @ApiProperty({ description: '工作空间 ID' })
  workspaceId: string;

  @ApiProperty({ description: '创建时间' })
  createdAt: string;

  @ApiProperty({ description: '更新时间' }) 
  updatedAt: string;
}