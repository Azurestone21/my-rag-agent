import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateChunkDto {
  @ApiProperty({ description: '文档ID' })
  @IsUUID()
  documentId: string;

  @ApiProperty({ description: '切片内容' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  content: string;
}
