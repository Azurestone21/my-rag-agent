import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateServiceCallDto {
  @ApiProperty({ description: '服务调用名称' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

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
}
