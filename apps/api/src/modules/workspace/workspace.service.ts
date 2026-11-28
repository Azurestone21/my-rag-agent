import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkspaceMember } from '../../entities/workspace-member.entity.js';
import { Repository } from 'typeorm';

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectRepository(WorkspaceMember)
    private memberRepository: Repository<WorkspaceMember>,
  ) {}

  // 检查用户是否有权访问该工作空间
  async checkAccess(workspaceId: string, userId: number) {
    const member = await this.memberRepository.findOne({
      where: { workspaceId, userId },
    });
    if (!member) {
      throw new ForbiddenException('您不在该工作空间内，无权访问');
    }
    return member;
  }
}
