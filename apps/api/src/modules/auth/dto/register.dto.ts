import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

import { IsString } from 'class-validator';

import { MinLength } from 'class-validator';

import { MaxLength } from 'class-validator';

export class RegisterDto {
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
