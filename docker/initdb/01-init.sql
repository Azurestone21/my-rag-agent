-- 启用 pgvector 扩展（docker-entrypoint-initdb.d 在首次初始化空数据卷时执行）
CREATE EXTENSION IF NOT EXISTS vector;

-- chunks.content 的全文检索 GIN 索引
-- 使用 simple 分词器：英文按空格/标点分词，中文每个汉字为一个 token
-- 对已有数据库需手动执行：CREATE INDEX IF NOT EXISTS idx_chunks_content_tsv ON chunks USING GIN (to_tsvector('simple', content));
CREATE INDEX IF NOT EXISTS idx_chunks_content_tsv
  ON chunks USING GIN (to_tsvector('simple', content));
