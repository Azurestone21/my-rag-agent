import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateChunkDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}
