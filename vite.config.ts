import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import type { ConfigEnv, UserConfig } from 'vite'
import { createProxy } from './build/vite/proxy'
import { wrapperEnv } from './build/utils'
import { createVitePlugins } from './build/vite/plugin'
import pkg from './package.json'
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
    define: { // 定义全局常量替换方式。其中每项在开发环境下会被定义在全局，而在构建时被静态替换。
      __APP_INFO__: JSON.stringify(__APP_INFO__),
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '#': fileURLToPath(new URL('./types', import.meta.url)),
        'apis': fileURLToPath(new URL('./src/apis', import.meta.url)),
        'images': fileURLToPath(new URL('./src/assets/images', import.meta.url)),
        'less': fileURLToPath(new URL('./src/assets/less', import.meta.url)),
        'components': fileURLToPath(new URL('./src/components', import.meta.url)),
        'enums': fileURLToPath(new URL('./src/enums', import.meta.url)),
        'hooks': fileURLToPath(new URL('./src/hooks', import.meta.url)),
        'http': fileURLToPath(new URL('./src/http', import.meta.url)),
        'utils': fileURLToPath(new URL('./src/utils', import.meta.url))
      }
    },
    css: {
      preprocessorOptions: {
        less: {
          modifyVars: { // 或者 globalVars
            // `themeColor` is global variables fields name
            themeColor: '#1677FF'
          },
          javascriptEnabled: true
        }
      }
    },
    server: {
      host: true, // 指定服务器应该监听哪个 IP 地址。 如果将此设置为 0.0.0.0 或者 true 将监听所有地址，包括局域网和公网地址。
      port: VITE_PORT, // 指定开发服务器端口，默认 5173
      proxy: createProxy(VITE_PROXY), // 为开发服务器配置自定义代理规则。期望接收一个 { key: options } 对象
      open: true // 开发服务器启动时，自动在浏览器中打开应用程序。当该值为字符串时，它将被用作 URL 的路径名。
    }
  }
})
