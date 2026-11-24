import { Reflector } from '@nestjs/core';

// 访问权限装饰器
export const SkipAuth = Reflector.createDecorator<boolean>();
