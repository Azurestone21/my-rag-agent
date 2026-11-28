import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import type { Workspace } from './workspace.entity.js';
import { User } from './user.entity.js';
import { WORKSPACE_ROLE } from '@my-rag-agent/shared';
import type { WorkspaceRole } from '@my-rag-agent/shared';

@Entity('workspace_members')
export class WorkspaceMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'workspaceId', comment: '工作空间ID' })
  workspaceId: string;

  @Column({ name: 'userId', comment: '用户ID' })
  userId: number;

  @Column({ type: 'int', default: WORKSPACE_ROLE.MEMBER, comment: '角色：1(拥有者)、2(管理员)、3(普通成员)' })
  role: WorkspaceRole;

  @ManyToOne( 'Workspace', (workspace: any) => workspace.members)
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
