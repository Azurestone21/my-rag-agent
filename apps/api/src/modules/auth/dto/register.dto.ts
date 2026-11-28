import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';
import { RegisterDto as RegisterDtoShared } from '@my-rag-agent/shared';
export class RegisterDto implements RegisterDtoShared {
  @ApiProperty({ description: '用户名' })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  username: string;

  @ApiProperty({ description: '密码' })
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  password: string;

  @ApiProperty({ description: '确认密码' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  confirmPassword: string;
}
