import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    // 将 /api 请求代理到 NestJS 后端，避免开发时 CORS 问题
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        /**
         * 手动分包，消除 Vite 500 kB chunk 警告
         * 同时提升浏览器缓存复用率（vendor 包很少变，业务代码常变）
         *
         * 判断路径 node_modules 外的代码不分包，全部打进 index
         * node_modules 内按依赖性质拆成 4 个 vendor chunk
         */
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // React 全家桶（体积中等，更新频率最低）
            if (id.includes('react-router') || id.includes('/react/') || id.includes('/react-dom/')) {
              return 'vendor-react'
            }
            // UI 组件层（Radix + CVA + 样式工具）
            if (id.includes('@radix-ui') || id.includes('class-variance-authority') || id.includes('tailwind-merge') || id.includes('clsx')) {
              return 'vendor-ui'
            }
            // 工具库（图标库 + 通知 + 状态管理）
            if (id.includes('lucide-react') || id.includes('sonner') || id.includes('zustand')) {
              return 'vendor-utils'
            }
            // 兜底：其他所有第三方依赖
            return 'vendor'
          }
        },
      },
    },
  },
})
