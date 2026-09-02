import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { SearchResultDto } from '@my-rag-agent/shared';
import { Chunk } from '../../entities/chunk.entity.js';
import { SearchHistory } from '../../entities/search-history.entity.js';
import { EmbeddingsService } from '../embeddings/embeddings.service.js';
import { SearchDto } from './dto/search.dto.js';

interface SearchRow {
  chunkId: string;
  documentName: string;
  content: string;
  similarity: string;
}

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Chunk)
    private readonly chunks: Repository<Chunk>,
    @InjectRepository(SearchHistory)
    private readonly histories: Repository<SearchHistory>,
    private readonly embeddings: EmbeddingsService,
  ) {}

  async search(dto: SearchDto): Promise<SearchResultDto[]> {
    const vector = await this.embeddings.embedQuery(dto.query);
    const vectorLiteral = `[${vector.join(',')}]`;

    const rows = await this.chunks
      .createQueryBuilder('c')
      .innerJoin('documents', 'd', 'd.id = c.document_id')
      .innerJoin('knowledge_bases', 'kb', 'kb.id = d.knowledge_base_id')
      .select('c.id', 'chunkId')
      .addSelect('d.name', 'documentName')
      .addSelect('c.content', 'content')
      .addSelect('1 - (c.embedding <=> :vector)', 'similarity')
      .where('kb.id = :knowledgeBaseId', {
        knowledgeBaseId: dto.knowledgeBaseId,
      })
      .andWhere('c.embedding IS NOT NULL')
      .orderBy('c.embedding <=> :vector', 'ASC')
      .limit(dto.topK)
      .setParameter('vector', vectorLiteral)
      .getRawMany<SearchRow>();

    const results = rows
      .map((row) => ({
        chunkId: row.chunkId,
        documentName: row.documentName,
        content: row.content,
        similarity: Number(row.similarity),
      }))
      .filter((row) => row.similarity >= dto.minSimilarity);

    await this.histories.save(
      this.histories.create({
        knowledgeBaseId: dto.knowledgeBaseId,
        query: dto.query,
        resultsCount: results.length,
      }),
    );

    return results;
  }
}
