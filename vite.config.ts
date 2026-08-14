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
          javascriptEnabled: true,
          additionalData: `@import "less/global.less";`
        },
        scss: {
          additionalData: `
            @use "sass" as *;
            @import "sass/global.scss";
          `
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
