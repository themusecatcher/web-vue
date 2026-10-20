import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
import { VueAmazingUIResolver } from 'vue-amazing-ui'

// 独立配置，不复用 vite.config.ts：后者为应用构建模式，含 mock / inspect / compress 等
// 与测试无关的插件，且 build 配置会干扰 vitest 的模块解析（与 vue-amazing-ui 的 tests 体系同款取舍）。
// 但 AutoImport / Components 管线必须与 vite.config.ts 保持一致：源码依赖自动注入的全局 API
// （stores 的 defineStore/ref、App.vue 的 onBeforeUnmount）与组件解析，缺失会直接报
// `defineStore is not defined`（该管线曾由 vitest.smoke.config.ts 单独维护，现已合并至此）。
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      dirs: ['src/apis/**', 'src/utils/*.ts'],
      imports: ['vue', 'vue-router', 'pinia'],
      dts: false // 测试运行不写 auto-imports.d.ts，避免生成文件的副作用（类型声明由 dev/build 产出）
    }),
    Components({
      dirs: ['src/components'],
      deep: true,
      dts: false, // 同上，不写 components.d.ts
      resolvers: [AntDesignVueResolver({ importStyle: false }), VueAmazingUIResolver({ cjs: false })]
    })
  ],
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
    include: ['tests/**/*.spec.ts'],
    // vue-amazing-ui 的样式入口含 .css，需内联走 Vite 管线而非 Node 原生加载
    server: {
      deps: {
        inline: ['vue-amazing-ui']
      }
    }
  }
})
