import { Type } from 'class-transformer';
import { IsOptional, Max, Min } from 'class-validator';
import { SearchDto } from '../../search/dto/search.dto.js';

export class ChatDto extends SearchDto {
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  @Max(2)
  temperature: number = 0.3;
}
