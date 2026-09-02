import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class VectorIndexInitializer implements OnModuleInit {
  private readonly logger = new Logger(VectorIndexInitializer.name);

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async onModuleInit(): Promise<void> {
    await this.dataSource.query(
      `CREATE INDEX IF NOT EXISTS idx_chunks_embedding_hnsw
       ON chunks USING hnsw (embedding vector_cosine_ops)`,
    );
    this.logger.log('HNSW 向量索引已就绪');
  }
}
