import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  getHttpStatusMessageZh,
  isDefaultHttpStatusMessage,
} from '../constants/http-status-message.js';
import { ResponseVo } from '../vo/response.vo.js'; 

@Catch(HttpException) // 捕获 HttpException 异常
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const statusCode = exception.getStatus();

    const message = this.extractErrorMessage(exception);

    const standardResponse: ResponseVo<null> = {
      code: statusCode,
      message: this.toChineseMessage(statusCode, message),
      data: null, // 异常时 data 通常为 null
      timestamp: new Date().toISOString(),
    };

    response.status(statusCode).json(standardResponse);
  }

  private toChineseMessage(statusCode: number, message: string): string {
    if (isDefaultHttpStatusMessage(statusCode, message)) {
      return getHttpStatusMessageZh(statusCode);
    }

    return message || getHttpStatusMessageZh(statusCode);
  }

  /**
   * 安全地从 HttpException 中提取错误消息
   * 支持：
   * - 简单字符串错误
   * - 包含 message 字段的对象
   * - class-validator 的错误数组
   */
  private extractErrorMessage(exception: HttpException): string {
    // 获取原始错误响应
    const response = exception.getResponse();

    // 情况1：响应是字符串
    if (typeof response === 'string') {
      return response;
    }

    // 情况2：响应是对象
    if (response && typeof response === 'object') {
      const obj = response as Record<string, unknown>;

      // 检查是否有 message 字段
      if ('message' in obj) {
        const msg = obj.message;

        // message 是字符串
        if (typeof msg === 'string') {
          return msg;
        }

        // message 是数组（class-validator 错误）
        if (Array.isArray(msg) && msg.length > 0) {
          // 提取所有字符串类型的错误
          const stringErrors = msg.filter(
            (item): item is string => typeof item === 'string',
          );
          if (stringErrors.length > 0) {
            // 如果有多个错误，用逗号连接
            // return stringErrors.join(', ');
            return stringErrors[0];
          }

          // 如果数组元素是对象（复杂的验证错误）
          const objectErrors = msg.filter(
            (item): item is Record<string, unknown> =>
              typeof item === 'object' && item !== null,
          );
          if (objectErrors.length > 0) {
            // 提取每个对象的 message 或 description 字段
            const extracted = objectErrors
              .map((item) => {
                if ('message' in item && typeof item.message === 'string') {
                  return item.message;
                }
                if (
                  'description' in item &&
                  typeof item.description === 'string'
                ) {
                  return item.description;
                }
                return null;
              })
              .filter((item): item is string => item !== null);

            if (extracted.length > 0) {
              return extracted.join(', ');
            }
          }
        }
      }

      // 如果对象中有 error 字段
      if ('error' in obj && typeof obj.error === 'string') {
        return obj.error;
      }
    }

    // 兜底：使用异常自带的 message
    return exception.message;
  }
}
