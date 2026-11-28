import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequireWorkspace } from '../decorators/RequireWorkspace.decorator.js';
import { WorkspaceService } from '../modules/workspace/workspace.service.js';

@Injectable()
export class WorkspaceGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private workspaceService: WorkspaceService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isRequired = this.reflector.getAllAndOverride<boolean>(
      RequireWorkspace,
      [context.getHandler(), context.getClass()],
    );

    if (!isRequired) return true; // 不需要，直接放行

    const request = context.switchToHttp().getRequest();
    const workspaceId = request.headers['x-workspace-id'];

    if (!workspaceId) {
      throw new BadRequestException('缺少 x-workspace-id 请求头');
    }

    const user = request.user;
    if (!user || !user.userId) {
      throw new UnauthorizedException('用户未登录或 Token 无效');
    }

    // 调用 Service 校验权限
    try {
      // 如果用户不在空间里，checkAccess 内部会抛出 ForbiddenException
      await this.workspaceService.checkAccess(workspaceId, user.userId);
    } catch (error) {
      // 如果你想自定义错误信息，可以在这里捕获，或者直接让它抛出
      throw new ForbiddenException('您不在该工作空间内，无权访问');
    }

    // 把 workspaceId 挂载到 request 上，方便后续使用
    request.workspaceId = workspaceId;
    return true;
  }
}
