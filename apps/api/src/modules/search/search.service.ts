import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { SearchResultDto } from '@my-rag-agent/shared';
import { Chunk } from '../../entities/chunk.entity.js';
import { SearchHistory } from '../../entities/search-history.entity.js';
import { EmbeddingsService } from '../embeddings/embeddings.service.js';
import { RerankService } from '../rerank/rerank.service.js';
import { SearchDto } from './dto/search.dto.js';

interface SearchRow {
  chunkId: string;
  documentName: string;
  content: string;
  similarity: string;
}

interface Fused {
  chunkId: string;
  documentName: string;
  content: string;
  score: number;
  keywordRank?: number;
  vectorSimilarity?: number;
}

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Chunk)
    private readonly chunks: Repository<Chunk>,
    @InjectRepository(SearchHistory)
    private readonly histories: Repository<SearchHistory>,
    private readonly embeddings: EmbeddingsService,
    private readonly rerank: RerankService,
  ) {}

  async search(dto: SearchDto): Promise<SearchResultDto[]> {
    const hybridTopK = dto.topK * 4; // 两边各取更多，融合后再截断

    // ========== 1. 向量检索（语义相似度） ==========
    const vector = await this.embeddings.embedQuery(dto.query);
    const vectorLiteral = `[${vector.join(',')}]`;

    const vectorRows = await this.chunks
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
      .limit(hybridTopK)
      .setParameter('vector', vectorLiteral)
      .getRawMany<SearchRow>();

    // ========== 2. 关键词检索（Postgres 原生全文检索） ==========
    const rawQuery = dto.query.trim();

    const keywordTokens = (
      rawQuery.match(/[\u4e00-\u9fa5]+|[a-zA-Z0-9]+/g) || []
    )
      .map((w) => w.replace(/[|&!*()]/g, '')) // 剔除特殊字符，防止 to_tsquery 报错
      .filter((w) => w.length > 0)
      .map((w) => w + ':*'); // 加前缀匹配
    const keywordQuery = keywordTokens.join(' & ');

    const keywordRows: SearchRow[] = keywordQuery
      ? await this.chunks
          .createQueryBuilder('c')
          .innerJoin('documents', 'd', 'd.id = c.document_id')
          .innerJoin('knowledge_bases', 'kb', 'kb.id = d.knowledge_base_id')
          .select('c.id', 'chunkId')
          .addSelect('d.name', 'documentName')
          .addSelect('c.content', 'content')
          .addSelect(
            "ts_rank(to_tsvector('simple', c.content), to_tsquery('simple', :keywordQuery))",
            'similarity',
          )
          .where('kb.id = :knowledgeBaseId', {
            knowledgeBaseId: dto.knowledgeBaseId,
          })
          .andWhere(
            "to_tsvector('simple', c.content) @@ to_tsquery('simple', :keywordQuery)",
          )
          .orderBy('similarity', 'DESC')
          .limit(hybridTopK)
          .setParameter('keywordQuery', keywordQuery)
          .getRawMany<SearchRow>()
      : [];

    // ========== 3. 融合：给每个 chunk 计算综合分数 ==========
    // 分数规则：
    //   - 关键词命中（归一化 ts_rank）: [0, 1]
    //   - 向量相似度 (1 - 余弦距离): [0, 1]
    //   - 两边都命中: 加权融合 (keyword × 0.6 + vector × 0.4) + 0.05 bonus
    //   - 只命中一边: 直接用单边分数
    const keywordWeight = 1 - (dto.denseWeight ?? 0.5);
    const vectorWeight = dto.denseWeight ?? 0.5;
    const BONUS = 0.05; // 双命中加分，鼓励两边都命中的结果排更前

    // 先找出 keywordRows 中 ts_rank 的最大值，用来归一化
    // keywordRows 为空时设为 1（避免除 0），但实际不会走到融合分支
    const maxTsRank =
      keywordRows.length > 0
        ? Math.max(...keywordRows.map((r) => Number(r.similarity)))
        : 1;

    const fused = new Map<string, Fused>();

    vectorRows.forEach((row) => {
      fused.set(row.chunkId, {
        chunkId: row.chunkId,
        documentName: row.documentName,
        content: row.content,
        score: Number(row.similarity),
        vectorSimilarity: Number(row.similarity),
      });
    });

    keywordRows.forEach((row, idx) => {
      const normKeywordScore = Number(row.similarity) / maxTsRank; // 归一化到 [0, 1]
      const existing = fused.get(row.chunkId);
      if (existing) {
        // 两边都命中 → 加权融合 + bonus
        existing.score =
          normKeywordScore * keywordWeight +
          (existing.vectorSimilarity ?? 0) * vectorWeight +
          BONUS;
        existing.keywordRank = idx + 1;
      } else {
        // 只命中关键词
        fused.set(row.chunkId, {
          chunkId: row.chunkId,
          documentName: row.documentName,
          content: row.content,
          score: normKeywordScore,
          keywordRank: idx + 1,
        });
      }
    });

    // ========== 4. 排序 + 截断 + 相似度过滤 ==========
    let sorted = Array.from(fused.values()).sort((a, b) => b.score - a.score);

    // ========== 5. Rerank (optional) ==========
    const rerankModel = dto.rerankModel?.trim();
    if (rerankModel && rerankModel !== '暂不启用') {
      const rerankCandidates = sorted.slice(0, Math.min(sorted.length, 50));
      const documents = rerankCandidates.map((c) => c.content);
      try {
        const rerankResults = await this.rerank.rerank(
          dto.query,
          documents,
          rerankModel,
          dto.topK,
        );
        sorted = rerankResults
          .filter((r) => r.index < rerankCandidates.length)
          .map((r) => ({
            ...rerankCandidates[r.index],
            score: r.relevance_score,
          }));
      } catch (err) {
        // Rerank failed, fall through with fusion scores
      }
    }

    const results = sorted
      // minSimilarity 过滤的是融合后的综合分数（前端显示的那个）
      .filter((item) => item.score >= dto.minSimilarity)
      .slice(0, dto.topK)
      .map((item) => ({
        chunkId: item.chunkId,
        documentName: item.documentName,
        content: item.content,
        similarity: Math.min(item.score, 1), // 上限 1
      }));

    // ========== 6. 记录检索历史 ==========
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
