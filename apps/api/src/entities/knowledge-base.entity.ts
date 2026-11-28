import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Workspace } from './workspace.entity.js';
import { Base } from './base.entity.js';

@Entity('knowledge_bases')
export class KnowledgeBase extends Base {
  @PrimaryColumn('uuid', {
    default: () => 'gen_random_uuid()',
    comment: '知识库 ID',
  })
  id: string;

  @Column({ type: 'varchar', length: 255, comment: '知识库名称' })
  name: string;

  @Column({ type: 'text', nullable: true, comment: '知识库描述' })
  description: string | null;

  @Column({ type: 'uuid', name: 'workspaceId', comment: '知识库所属工作空间 ID' })
  workspaceId: string;

  @ManyToOne(() => Workspace, (workspace) => workspace.knowledgeBases)
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;
}
