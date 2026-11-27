import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { DocumentGetPageDto as DocumentGetPageDtoShare } from '@my-rag-agent/shared';
import { CommonPageDto } from '../../../dto/commonPage.dto.js';

export class DocumentGetPageDto
  extends CommonPageDto
  implements DocumentGetPageDtoShare
{
  @ApiProperty({ description: '知识库 ID' })
  @IsNotEmpty({ message: '知识库 ID 不能为空' })
  knowledgeBaseId: string;

  @ApiProperty({ description: '文档名称' })
  name?: string;
}
