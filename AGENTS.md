# AGENTS.md

本文件是 `my-rag-agent` 项目的协作约定，供所有后续开发会话（Codex / Claude 等）遵循。

## 项目概览

- 项目名：`my-rag-agent`
- 定位：企业级 RAG 知识库
- 结构：Turborepo monorepo + pnpm workspace
- 前端：`apps/web`（React 19 + TypeScript + Vite + Tailwind CSS v4 + shadcn-ui + React Router v7 + Zustand）
- 后端：`apps/api`（NestJS，阶段四联调）
- 计划文档：[项目开发计划.md](./项目开发计划.md)
- 进度交接：~~[HANDOFF.md](./HANDOFF.md)~~（已删除，进度以 项目开发计划.md 与 AGENTS.md 为准）

## 必须遵守的开发规则

1. **每一步开发前先说明要做什么，用户确认后再写代码**；不要一口气做完所有步骤
2. 文档变更：不删除原内容，使用 `~~划线~~` 表示删除，在后面新增内容，保留前后对比
3. 前端页面样式以 `D:\Project\nodejs\nestjs\image` 下的设计图为准
4. 用户要求替换/重命名时，全局保持一致（例如 miaoma → my-rag-agent）
5. 需要联网的命令（如 `pnpm build`，tsc/vite 需解析原生编译器）在沙箱内要请求授权

## 常用命令

```bash
pnpm install            # 根目录安装依赖
pnpm dev --filter=web   # 只启动前端
pnpm build              # 构建（根目录或 apps/web）
```

## 前端代码约定（apps/web）

- 路径别名：`@/` → `src/`
- 页面：`src/pages/`（KnowledgeBase、DocumentManage、ChunkManage、KnowledgeSearch、KnowledgeQA）
- 布局：`src/components/layout/`（AppLayout、Sidebar、~~StepIndicator~~ CreateKnowledgeBaseButton）
- 复用组件：`src/components/params/`、`src/components/qa/`
- shadcn 组件：`src/components/ui/`（不要改这些组件的默认导出约定）
- 状态：`src/store/`（Zustand，按知识库/文档/切片/检索/问答拆分）
- 类型与数据模型：~~`src/mock/data.ts`~~（已删除，改用共享包 `@my-rag-agent/shared` 的 DTO 类型 + 真实 API）
- 主题：`src/index.css`（Tailwind v4 入口；主色 #5a55ff、页面背景 #f6fafd）
- 路由：`src/router/index.tsx`

## 当前状态（~~2026-08-31~~ 2026-09-03）

- ~~前端计划 6 步已全部完成，`pnpm build` 通过~~ MVP（阶段一 ~ 四）全部完成，端到端测试通过，`pnpm build` 通过
- 前端已接入后端真实 API（~~全部使用 mock 数据，尚未对接后端真实 API~~）
- 后端：NestJS + TypeORM + pgvector；模块：KnowledgeBase / Document / Chunk / Search / Chat（SSE）/ ServiceCall / Embeddings；共享类型包 `@my-rag-agent/shared`
- 支持文档格式：CSV / XLSX / XLS / TXT / MD（结构化按行切分，非结构化用 RecursiveCharacterTextSplitter）
- 前端能力：问答 SSE 流式并可停止；手动新增/编辑切片自动生成向量；manualChunks 分包消除 chunk 警告；切片详情带 `?documentId=` 定位
- 部署：`docker compose up -d` 一键启动 postgres + api + web（nginx 反代 `/api`、支持 SSE）
- 布局：无顶部栏；侧边栏为"当前知识库"下拉 + 4 个子导航（缩进、小一号字号），可折叠
- 页面功能：知识库/文档/切片/检索/问答均已联调真实 API
- 待办：~~本地预览、代码分割（消除 500 kB chunk 警告）、后端联调~~ 工程清理（`.vscode/`、根目录测试 xlsx、未提交改动）；后续迭代见 [项目开发计划.md](./项目开发计划.md)「九、后续开发计划」

## 注意事项

- 构建依赖网络（tsc/vite 需解析原生编译器），沙箱内需授权执行 `pnpm build`
- shadcn 组件统一放在 `src/components/ui/`，CLI 生成位置异常（如 `@/components`）时需修正
