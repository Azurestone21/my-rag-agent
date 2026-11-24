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
  @PrimaryColumn('uuid', {
    default: () => 'gen_random_uuid()',
    comment: '文档 ID',
  })
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

  @Column({
    type: 'int',
    default: 1,
    comment:
      '文档状态 (1:pending 2:processing 3:completed 4:failed 5:canceled）',
  })
  status: number;

  @Column({ type: 'int', default: 0, comment: '切片数量' })
  chunkCount: number;

  @Column({ type: 'int', default: 1, comment: '导入方式（1: 本地上传，2: 从 URL 导入）' })
  importMethod: number;

  @Column({ type: 'int', default: 1, comment: '处理策略（1: 默认，2: 自定义分段）' })
  strategy: number;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: '文件处理配置（分段/表头/数据行等）',
  })
  config: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'timestamptz', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', comment: '更新时间' })
  updatedAt: Date;
}
