# my-rag-agent

企业级 RAG 知识库平台：上传表格/文档 → 自动切片并向量化 → 语义检索 → LLM 问答（SSE 流式），并支持以 API Key 对外提供问答接口。

## 技术栈

| 层     | 技术                                                                                   |
| ------ | -------------------------------------------------------------------------------------- |
| 前端   | React 19 + TypeScript + Vite + Tailwind CSS v4 + shadcn-ui + React Router v7 + Zustand |
| 后端   | NestJS + TypeORM + Multer + LangChain.js                                               |
| 数据库 | PostgreSQL 16 + pgvector（HNSW 索引）                                                  |
| 模型   | 阿里云百炼（OpenAI 兼容接口）：embedding + LLM                                         |
| 工程   | Turborepo + pnpm workspace + Docker Compose                                            |

## 功能特性

- 知识库管理：创建/删除/统计，页面按当前知识库切换上下文
- 文档管理：上传 CSV / XLSX / XLS / TXT / MD，自动解析与切片、状态跟踪、手动重处理
- 切片管理：按文档筛选、新增/编辑/删除、查看原文、自动生成向量
- 语义检索：pgvector 余弦相似度 + 检索参数（topK/相似度阈值/重排/权重）
- 知识问答：RAG + SSE 流式输出（metadata/sources/content/done/error），支持停止生成、引用来源展示
- 服务调用：自动生成 API Key，对外提供鉴权后的流式问答接口

## 快速开始

### Docker Compose 一键启动（推荐）

1. 复制环境变量模板并填写：

```bash
cp .env.example .env
```

至少需要修改 `LLM_API_KEY`；如默认端口被占用，可调整 `API_PORT` / `WEB_PORT`。

2. 构建并启动（DB + API + Web）：

```bash
docker compose up -d --build
```

访问：

- Web：[http://localhost:5173](http://localhost:5173)（默认 `WEB_PORT`）
- API：[http://localhost:3000/api](http://localhost:3000/api)（默认 `API_PORT`，nginx 已代理 `/api`）
- 数据库：`localhost:5432`（pgAdmin 等工具，账号密码见 `.env`）

### 本地开发

Node.js > v22.13

```bash
pnpm install        # 安装全部依赖（需先启动 PostgreSQL，可单独启动 docker-compose 的 postgres 服务）
pnpm dev            # 同时启动前端 + 后端
pnpm dev --filter=web   # 只启动前端（5173）
pnpm dev --filter=api   # 只启动后端（3000）
```

## 环境变量

见 [.env.example](./.env.example)：

- PostgreSQL：`POSTGRES_HOST/PORT/USER/PASSWORD/DB`、`DATABASE_URL`
- 百炼：`LLM_API_KEY`、`LLM_BASE_URL`、`LLM_EMBEDDING_MODEL`、`LLM_CHAT_MODEL`
- 服务：`API_PORT`、`WEB_PORT`、`API_BASE_URL`、`CORS_ORIGIN`

## 项目结构

```text
my-rag-agent/
├── apps/
│   ├── web/                 # React 前端（pages / components / service / store）
│   └── api/                 # NestJS 后端（entities / modules）
├── packages/
│   └── shared/              # @my-rag-agent/shared 共享 DTO 类型
├── docker/
│   └── initdb/              # PostgreSQL 初始化脚本（启用 pgvector）
├── docker-compose.yml       # postgres + api + web 一键启动
├── .env.example             # 环境变量模板
└── 项目开发计划.md             # 计划、进度与后续路线
```

## 主要 API

全局前缀 `/api`，除服务调用接口外均无鉴权（开发阶段）：

| 模块     | 接口                                                                                          |
| -------- | --------------------------------------------------------------------------------------------- |
| 知识库   | `GET/POST /knowledge-bases`、`GET/PATCH/DELETE /knowledge-bases/:id`                      |
| 文档     | `POST /documents/upload`、`GET /documents`、`GET/DELETE /documents/:id`                 |
| 切片     | `POST /chunks/process/:documentId`、`GET/POST /chunks`、`GET/PATCH/DELETE /chunks/:id`  |
| 检索     | `GET /search?knowledgeBaseId=&query=&topK=&minSimilarity=`                                  |
| 问答     | `POST /chat/stream`（SSE）                                                                  |
| 服务调用 | `GET/POST/DELETE /service-calls`、`POST /service-calls/:id/chat/stream`（Bearer API Key） |

## 文档

- [项目开发计划.md](./项目开发计划.md)：MVP 进度与「九、后续开发计划」
- [AGENTS.md](./AGENTS.md)：协作约定（供 Codex/Claude 等 AI 助手遵循）
