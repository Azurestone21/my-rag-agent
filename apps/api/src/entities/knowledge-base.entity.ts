import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('knowledge_bases')
export class KnowledgeBase {
  @PrimaryColumn('uuid', { default: () => 'gen_random_uuid()', comment: '知识库 ID' })
  id: string;

  @Column({ type: 'varchar', length: 255, comment: '知识库名称' })
  name: string;

  @Column({ type: 'text', nullable: true, comment: '知识库描述' })
  description: string | null;

  @CreateDateColumn({ type: 'timestamptz', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', comment: '更新时间' })
  updatedAt: Date;
}
