import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class StreamMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  message: string;
}
