import { IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SearchDto {
  @ApiProperty({ description: '查询内容' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  query: string;

  @ApiProperty({ description: '知识库ID' })
  @IsString()
  @IsNotEmpty()
  knowledgeBaseId: string;

  @ApiProperty({ description: '返回结果数量' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  topK: number = 10;

  @ApiProperty({ description: '最小相似度' })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  @Max(1)
  minSimilarity: number = 0;

  @ApiProperty({ description: '密集权重' })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  @Max(1)
  denseWeight: number = 0.5;

  @ApiProperty({ description: '重排模型' })
  @IsOptional()
  @IsString()
  rerankModel: string = '';
}
