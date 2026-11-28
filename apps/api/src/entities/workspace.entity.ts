import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Relation } from 'typeorm';
import type { WorkspaceMember } from './workspace-member.entity.js';
import { KnowledgeBase } from './knowledge-base.entity.js';
import { Base } from './base.entity.js';
import { WORKSPACE_TYPE, type WorkspaceType } from '@my-rag-agent/shared';

@Entity('workspaces', { comment: '工作空间表（个人或团队）' })
export class Workspace extends Base {
  @PrimaryGeneratedColumn('uuid', { comment: '工作空间ID' })
  id: string;

  @Column({ length: 255, comment: '工作空间名称' })
  name: string;

  @Column({
    type: 'int',
    default: WORKSPACE_TYPE.PERSONAL,
    comment: '空间类型：1(个人)、2(团队)',
  })
  type: WorkspaceType;

  @Column({ name: 'ownerId', comment: '拥有者ID' })
  ownerId: number;

  @OneToMany('WorkspaceMember', (member: any) => member.workspace)
  members: WorkspaceMember[];
  
  @OneToMany(() => KnowledgeBase, (kb) => kb.workspace)
  knowledgeBases: KnowledgeBase[];
}
