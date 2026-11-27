import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Response } from 'express';
import { Observable, map } from 'rxjs';
import { ResponseVo } from '../vo/response.vo.js';
import { getHttpStatusMessageZh } from '../constants/http-status-message.js';

/**
 * 响应拦截器
 * 用于统一格式化 API 响应数据
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ResponseVo<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ResponseVo<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();

    return next.handle().pipe(
      map<T, ResponseVo<T>>((data) => ({
        code: response.statusCode,
        message: getHttpStatusMessageZh(response.statusCode),
        data: data ?? ({} as T),
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
