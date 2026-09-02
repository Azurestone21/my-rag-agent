import { IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  query: string;

  @IsString()
  @IsNotEmpty()
  knowledgeBaseId: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  topK: number = 10;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  @Max(1)
  minSimilarity: number = 0;
}
