import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateKnowledgeBaseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  description?: string;
}
