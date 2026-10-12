import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

// 独立配置，不复用 vite.config.ts：后者为应用构建模式，含 mock / inspect / compress 等
// 与测试无关的插件，且 build 配置会干扰 vitest 的模块解析（与 vue-amazing-ui 的 tests 体系同款取舍）
export default defineConfig({
  plugins: [vue()],
  resolve: {
    // 与 vite.config.ts 保持一致，源码中使用 @/ #/ components/ 等别名
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '#': fileURLToPath(new URL('./types', import.meta.url)),
      apis: fileURLToPath(new URL('./src/apis', import.meta.url)),
      images: fileURLToPath(new URL('./src/assets/images', import.meta.url)),
      less: fileURLToPath(new URL('./src/assets/less', import.meta.url)),
      sass: fileURLToPath(new URL('./src/assets/sass', import.meta.url)),
      components: fileURLToPath(new URL('./src/components', import.meta.url)),
      enums: fileURLToPath(new URL('./src/enums', import.meta.url)),
      hooks: fileURLToPath(new URL('./src/hooks', import.meta.url)),
      http: fileURLToPath(new URL('./src/http', import.meta.url)),
      stores: fileURLToPath(new URL('./src/stores', import.meta.url)),
      utils: fileURLToPath(new URL('./src/utils', import.meta.url))
    }
  },
  test: {
    environment: 'happy-dom',
    // 不开启 globals：所有用例显式 import，避免依赖 tsconfig 注入 vitest/globals 类型
    include: ['tests/**/*.spec.ts']
  }
})
