import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { KnowledgeBase } from './knowledge-base.entity.js';

@Entity('documents')
export class Document {
  @PrimaryColumn('uuid', { default: () => 'gen_random_uuid()', comment: '文档 ID' })
  id: string;

  @Column({ type: 'uuid', name: 'knowledge_base_id', comment: '所属知识库 ID' })
  knowledgeBaseId: string;

  @ManyToOne(() => KnowledgeBase, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'knowledge_base_id' })
  knowledgeBase: KnowledgeBase;

  @Column({ type: 'varchar', length: 255, comment: '文档名称' })
  name: string;

  @Column({ type: 'text', comment: '文件路径' })
  filePath: string;

  @Column({ type: 'varchar', length: 50, default: 'pending', comment: '文档状态（pending/processing/completed/failed）' })
  status: string;

  @Column({ type: 'int', default: 0, comment: '切片数量' })
  chunkCount: number;

  @Column({ type: 'varchar', length: 50, default: 'local_upload', comment: '导入方式' })
  importMethod: string;

  @Column({ type: 'varchar', length: 100, default: 'my_rag_agent_init_version', comment: '处理策略' })
  strategy: string;

  @Column({ type: 'jsonb', nullable: true, comment: '文件处理配置（分段/表头/数据行等）' })
  config: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'timestamptz', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', comment: '更新时间' })
  updatedAt: Date;
}
