import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { SkipAuth } from '../decorators/skipAuth.decorator.js';

// 定义 JWT 载荷接口
export interface JwtPayload {
  userId: number;
  username: string;
  role: number;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 检查是否有 @SkipAuth 装饰器（支持类级和方法级），如果有则跳过认证检查
    const isSkipAuth = this.reflector.getAllAndOverride<boolean>(SkipAuth, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isSkipAuth) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    // 提取 Token（支持 Cookie 和 Header）
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      // 验证 Token
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      // 将解析后的用户信息挂载到 request.user
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  /**
   * 综合提取 Token 的方法
   * 优先从 HttpOnly Cookie 中读取，其次从 Authorization Header 中读取
   */
  private extractToken(request: Request): string | undefined {
    // 1. 尝试从 Cookie 读取 (需要 app.use(cookieParser()) 支持)
    if (request.cookies && request.cookies['access_token']) {
      return request.cookies['access_token'] as string;
    }

    // 2. 尝试从 Authorization Header 读取
    const authHeader = request.headers.authorization;
    if (!authHeader) return undefined;

    const [type, token] = authHeader.split(' ');

    // 容错处理：防止 "Bearer  token" 中间有两个空格导致 token 为空
    return type === 'Bearer' && token ? token : undefined;
  }
}
