import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Document } from './document.entity.js';

@Entity('chunks')
export class Chunk {
  @PrimaryColumn('uuid', { default: () => 'gen_random_uuid()', comment: '切片 ID' })
  id: string;

  @Column({ type: 'uuid', name: 'document_id', comment: '所属文档 ID' })
  documentId: string;

  @ManyToOne(() => Document, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'document_id' })
  document: Document;

  @Column({ type: 'text', comment: '切片文本内容' })
  content: string;

  @Column({ type: 'int', default: 0, comment: '字符数' })
  charCount: number;

  @Column({ type: 'int', name: 'chunk_index', default: 0, comment: '切片序号' })
  chunkIndex: number;

  @Column({ type: 'vector', length: 1024, nullable: true, comment: '切片向量（1024 维）' })
  embedding: string | null;

  @CreateDateColumn({ type: 'timestamptz', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', comment: '更新时间' })
  updatedAt: Date;
}
