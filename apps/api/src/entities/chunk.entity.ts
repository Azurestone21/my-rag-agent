import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Document } from './document.entity.js';
import { Base } from './base.entity.js';

@Entity('chunks')
export class Chunk extends Base {
  @PrimaryColumn('uuid', {
    default: () => 'gen_random_uuid()',
    comment: '切片 ID',
  })
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

  @Column({
    type: 'vector',
    length: 1024,
    nullable: true,
    comment: '切片向量（1024 维）',
  })
  embedding: string | null;
}
