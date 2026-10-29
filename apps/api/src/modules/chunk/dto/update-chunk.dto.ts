import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateChunkDto {
  @ApiProperty({ description: '切片内容' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
