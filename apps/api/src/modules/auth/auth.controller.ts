import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { Controller, Post, Body } from '@nestjs/common';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { SkipAuth } from '../../decorators/skipAuth.decorator.js';
import { LoginVo } from './vo/login.vo.js';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 登录
  @ApiOperation({ summary: '用户登录' })
  @SkipAuth(true)
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoginVo> {
    return this.authService.login(loginDto);
  }

  // 注册
  @ApiOperation({ summary: '注册用户' })
  @SkipAuth(true)
  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<void> {
    await this.authService.register(registerDto);
  }
}
