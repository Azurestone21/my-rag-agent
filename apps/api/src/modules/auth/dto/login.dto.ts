import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class LoginDto {
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
