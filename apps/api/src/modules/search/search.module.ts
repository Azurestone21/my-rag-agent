import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chunk } from '../../entities/chunk.entity.js';
import { SearchHistory } from '../../entities/search-history.entity.js';
import { EmbeddingsModule } from '../embeddings/embeddings.module.js';
import { RerankModule } from '../rerank/rerank.module.js';
import { SearchController } from './search.controller.js';
import { SearchService } from './search.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chunk, SearchHistory]),
    EmbeddingsModule,
    RerankModule,
  ],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
