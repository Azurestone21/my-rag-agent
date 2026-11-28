import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspaceService } from './workspace.service.js';
import { Workspace } from '../../entities/workspace.entity.js';
import { WorkspaceMember } from '../../entities/workspace-member.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Workspace, WorkspaceMember])],
  providers: [WorkspaceService],
  exports: [WorkspaceService],
})
export class WorkspaceModule {}