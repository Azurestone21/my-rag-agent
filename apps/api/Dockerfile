# ---------- 构建阶段 ----------
FROM node:24-alpine AS build

RUN corepack enable
WORKDIR /app

COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @my-rag-agent/shared build && pnpm --filter api build

# ---------- 运行阶段 ----------
FROM node:24-alpine AS runner

ENV NODE_ENV=production
WORKDIR /app

COPY --from=build /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/turbo.json ./
COPY --from=build /app/packages/shared ./packages/shared
COPY --from=build /app/apps/api ./apps/api
COPY --from=build /app/node_modules ./node_modules

WORKDIR /app/apps/api
EXPOSE 3000
CMD ["node", "dist/main.js"]
