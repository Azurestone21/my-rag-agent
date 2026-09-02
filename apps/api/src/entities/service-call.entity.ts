import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { KnowledgeBase } from './knowledge-base.entity.js';

@Entity('service_calls')
export class ServiceCall {
  @PrimaryColumn('uuid', { default: () => 'gen_random_uuid()', comment: '服务调用 ID' })
  id: string;

  @Column({ type: 'uuid', name: 'knowledge_base_id', comment: '所属知识库 ID' })
  knowledgeBaseId: string;

  @ManyToOne(() => KnowledgeBase, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'knowledge_base_id' })
  knowledgeBase: KnowledgeBase;

  @Column({ type: 'varchar', length: 255, comment: '服务名称' })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true, name: 'api_key', comment: 'API Key' })
  apiKey: string;

  @Column({ type: 'int', name: 'top_k', default: 10, comment: '返回结果数量' })
  topK: number;

  @Column({ type: 'float', name: 'similarity_threshold', default: 0.5, comment: '最低相似度阈值' })
  similarityThreshold: number;

  @Column({ type: 'float', name: 'dense_weight', default: 0.5, comment: 'Dense 检索权重' })
  denseWeight: number;

  @CreateDateColumn({ type: 'timestamptz', comment: '创建时间' })
  createdAt: Date;
}
