import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { LoginDto as LoginDtoShared } from '@my-rag-agent/shared';

export class LoginDto implements LoginDtoShared {
  @ApiProperty({ description: '用户名' })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  username: string;

  @ApiProperty({ description: '密码' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  password: string;
}
