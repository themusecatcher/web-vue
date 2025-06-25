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
            themeColor: '#ff6900'
          },
          javascriptEnabled: true
        }
      }
    },
    build: {
      /*
        minify:
        设置为 false 可以禁用最小化混淆，或是用来指定使用哪种混淆器。
        默认为 'esbuild'，它比 terser 快 20-40 倍，压缩率只差 1%-2%。
        注意，在 lib 模式下使用 'es' 时，build.minify 选项不会缩减空格，因为会移除掉 pure 标注，导致破坏 tree-shaking。
        当设置为 'terser' 时必须先安装 Terser。（pnpm i terser -D）
      */
      minify: 'terser', // 类型：boolean | 'terser' | 'esbuild'，客户端构建默认为 'esbuild'，SSR构建默认为 false，Vite 2.6.x 以上需要配置 minify: "terser", terserOptions 才能生效
      terserOptions: { // 在打包代码时移除 console、debugger 和 注释
        compress: {
          /* (default: false) -- Pass true to discard calls to console.* functions.
            If you wish to drop a specific function call such as console.info and/or
            retain side effects from function arguments after dropping the function
            call then use pure_funcs instead
          */
          // 如果在调试控制台中打印了某个对象，则调试控制台就持有了对该对象的引用，该对象就无法被回收了，会导致内存泄露
          drop_console: isBuild, // 生产环境时移除 console
          drop_debugger: isBuild
        },
        format: {
          comments: isBuild // 生产环境时删除注释 comments
        }
      },
      // 把组件按组分块
      rollupOptions: {
        // https://cn.rollupjs.org/configuration-options/#output-manualchunks
        output: {
          // manualChunks: {
          //   'group-user': [
          //     './src/UserDetails',
          //     './src/UserDashboard',
          //     './src/UserProfileEdit'
          //   ]
          // }
          manualChunks: (id) => { // 打包优化，将不常变动的第三方依赖包统一放到 vendors 包中，这样每次打包时，vendors 包都保持不变，从而实现缓存
            if (id.includes('node_modules') && (id.endsWith('.js') || id.endsWith('.ts'))) {
              return 'vendors'
            }
          }
        }
      },
      // 静态资源分类打包配置 https://cn.vitejs.dev/config/build-options.html#build-rollupoptions
      // rollupOptions: {
      //   output: {
      //     entryFileNames: `js/[name]-[hash].js`, // 入口文件输出配置
      //     chunkFileNames: `js/[name]-[hash].js`, // 自定义命名代码分割中产生的 chunk
      //     assetFileNames: 'assets/[ext]/[name]-[hash].[ext]' // 静态资源分类打包
      //   }
      // }
    },
    server: {
      host: true, // 指定服务器应该监听哪个 IP 地址。 如果将此设置为 0.0.0.0 或者 true 将监听所有地址，包括局域网和公网地址。
      port: VITE_PORT, // 指定开发服务器端口，默认 5173
      proxy: createProxy(VITE_PROXY), // 只在开发和预览时生效。为开发服务器配置自定义代理规则。期望接收一个 { key: options } 对象
      open: true // 开发服务器启动时，自动在浏览器中打开应用程序。当该值为字符串时，它将被用作 URL 的路径名。
    }
  }
})
