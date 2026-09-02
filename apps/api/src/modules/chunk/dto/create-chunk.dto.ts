import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateChunkDto {
  @IsUUID()
  documentId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  content: string;
}
