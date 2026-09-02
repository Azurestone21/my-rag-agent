import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VectorIndexInitializer } from '../../database/vector-index.initializer.js';
import { Chunk } from '../../entities/chunk.entity.js';
import { Document } from '../../entities/document.entity.js';
import { EmbeddingsModule } from '../embeddings/embeddings.module.js';
import { ChunkController } from './chunk.controller.js';
import { ChunkService } from './chunk.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chunk, Document]),
    EmbeddingsModule,
  ],
  controllers: [ChunkController],
  providers: [ChunkService, VectorIndexInitializer],
  exports: [ChunkService],
})
export class ChunkModule {}
