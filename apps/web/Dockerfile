# ---------- 构建阶段 ----------
FROM node:24-alpine AS build

RUN corepack enable
WORKDIR /app

ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @my-rag-agent/shared build && pnpm --filter web build

# ---------- 运行阶段（Nginx 托管静态文件 + 反向代理 API） ----------
FROM nginx:alpine AS runner

COPY --from=build /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
