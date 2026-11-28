import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VectorIndexInitializer } from '../../database/vector-index.initializer.js';
import { Chunk } from '../../entities/chunk.entity.js';
import { Document } from '../../entities/document.entity.js';
import { EmbeddingsModule } from '../embeddings/embeddings.module.js';
import { ChunkController } from './chunk.controller.js';
import { ChunkService } from './chunk.service.js';
import { KnowledgeBase } from '../../entities/knowledge-base.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chunk, Document, KnowledgeBase]),
    EmbeddingsModule,
  ],
  controllers: [ChunkController],
  providers: [ChunkService, VectorIndexInitializer],
  exports: [ChunkService],
})
export class ChunkModule {}
