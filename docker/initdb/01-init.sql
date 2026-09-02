-- 启用 pgvector 扩展（docker-entrypoint-initdb.d 在首次初始化空数据卷时执行）
CREATE EXTENSION IF NOT EXISTS vector;
