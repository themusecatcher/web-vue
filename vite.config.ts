import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import type { ConfigEnv, UserConfig } from 'vite'
import { createProxy } from './build/vite/proxy.ts'
import { wrapperEnv } from './build/utils.ts'
import { createVitePlugins } from './build/vite/plugin/index.ts'
// 构建配置统一出口（old/new 两套均可立即使用，详见 build/vite/build-config/index.ts 头部说明）：
import { createBuildConfig } from './build/vite/build-config/index.ts'
// 切换旧版本配置（Vite ≤ 7.x）：将下方 build 行的 'new' 改为 'old'
import pkg from './package.json' with { type: 'json' }
import { format } from 'date-fns'
const { dependencies, devDependencies, name, version } = pkg

const __APP_INFO__ = {
  pkg: { dependencies, devDependencies, name, version },
  lastBuildTime: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
}

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }: ConfigEnv): UserConfig => {
  // 开发/构建时输出运行命令、mode 与代理配置，便于排查 env 解析问题
  console.log('command:', command)
  console.log('mode:', mode)
  const root = process.cwd()
  const env = loadEnv(mode, root)
  const viteEnv = wrapperEnv(env)
  const { VITE_PUBLIC_PATH, VITE_PORT, VITE_PROXY } = viteEnv
  console.log('VITE_PROXY:', VITE_PROXY)
  const isBuild = command === 'build'
  return {
    base: VITE_PUBLIC_PATH,
    plugins: createVitePlugins(viteEnv, isBuild),
    define: {
      // 定义全局常量替换方式。其中每项在开发环境下会被定义在全局，而在构建时被静态替换。
      __APP_INFO__: JSON.stringify(__APP_INFO__)
    },
    resolve: {
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
    css: {
      preprocessorOptions: {
        less: {
          modifyVars: {
            // 或者 globalVars
            // `theme-color` is global variables fields name
            // 'theme-color': '#ff6900'
          },
          javascriptEnabled: true
          // 不再经 additionalData 注入 global.less：该文件会产出 CSS（reset/body/a/工具类），
          // 注入后被复制进每个 less 块——scoped 下整体失效（如 body[data-v-x] 永不命中），
          // 非 scoped 下又变成多份全局重复。现由 main.ts 统一 import 一次，真正全局生效。
        },
        scss: {
          // 仅注入不产出 CSS 的 mixins/utils（sass → src/assets/sass/_index.scss）
          // 注意：src/assets/sass/global.scss 是全局样式的「二选一」scss 备选，当前项目走 less（见 src/main.ts 的 global.less），
          // 它没有被任何文件 import，属有意为之——切勿在此处 additionalData 或 main.ts 里再引它，
          // 否则会与 global.less 产生第二份全局重复（正是本次优化要消除的问题）
          additionalData: `@use "sass" as *;`
        }
      }
    },
    build: createBuildConfig(isBuild, 'new'), // 构建引擎：'new'（Vite ≥ 8.x，默认）| 'old'（Vite ≤ 7.x）
    server: {
      host: true, // 指定服务器应该监听哪个 IP 地址。 如果将此设置为 0.0.0.0 或者 true 将监听所有地址，包括局域网和公网地址。
      port: VITE_PORT, // 指定开发服务器端口，默认 5173
      proxy: createProxy(VITE_PROXY), // 只在开发和预览时生效。为开发服务器配置自定义代理规则。期望接收一个 { key: options } 对象
      open: true // 开发服务器启动时，自动在浏览器中打开应用程序。当该值为字符串时，它将被用作 URL 的路径名。
    }
  }
})
