import { defineConfig } from 'vitest/config'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { VueAmazingUIResolver } from 'vue-amazing-ui'

/**
 * 临时冒烟测试配置（验证完成后删除）
 * 与 vite.config.ts 保持一致的 AutoImport + Components(VueAmazingUIResolver) 解析管线，
 * 使演示页的自动按需引入在测试环境中同样生效。
 */
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia']
    }),
    Components({
      dirs: ['src/components'],
      deep: true,
      resolvers: [VueAmazingUIResolver({ cjs: false })]
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    environment: 'happy-dom',
    include: ['tests/smoke.spec.ts'],
    testTimeout: 120000,
    hookTimeout: 120000,
    // vue-amazing-ui 的样式入口含 .css，需内联走 Vite 管线而非 Node 原生加载
    server: {
      deps: {
        inline: ['vue-amazing-ui']
      }
    }
  }
})
