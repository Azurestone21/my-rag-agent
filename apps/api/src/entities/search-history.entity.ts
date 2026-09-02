import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { KnowledgeBase } from './knowledge-base.entity.js';

@Entity('search_histories')
export class SearchHistory {
  @PrimaryColumn('uuid', { default: () => 'gen_random_uuid()', comment: '检索历史 ID' })
  id: string;

  @Column({ type: 'uuid', name: 'knowledge_base_id', comment: '所属知识库 ID' })
  knowledgeBaseId: string;

  @ManyToOne(() => KnowledgeBase, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'knowledge_base_id' })
  knowledgeBase: KnowledgeBase;

  @Column({ type: 'text', comment: '检索语句' })
  query: string;

  @Column({ type: 'int', name: 'results_count', default: 0, comment: '结果数量' })
  resultsCount: number;

  @CreateDateColumn({ type: 'timestamptz', comment: '创建时间' })
  createdAt: Date;
}
