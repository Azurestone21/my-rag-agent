import { Reflector } from '@nestjs/core';

// 定义一个装饰器，用于标记需要 workspaceId 的路由
export const RequireWorkspace = Reflector.createDecorator<boolean>();