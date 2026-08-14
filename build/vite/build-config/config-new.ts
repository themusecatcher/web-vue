/**
 * 【新版本配置】Vite ≥ 8.x / Rolldown + OXC 时代构建配置（可立即使用）
 *
 * 环境依赖要求：
 * - Vite ≥ 8.x：底层打包器 Rolldown，压缩器默认 OXC（本配置通过 output.minify.compress 控制）
 * - Terser（备选）：minify 切换为 'terser' 时需安装 `pnpm i terser -D`
 * - Node ≥ 20.19.0（见 package.json engines）
 *
 * 使用方式（统一出口为 build-config/index.ts）：
 *   createBuildConfig(isBuild, 'new') // 'new' 为默认值，可省略
 *
 * 本配置完整覆盖旧版本（config-old.ts）全部配置项的等价实现（对应关系见 config-old.ts 头部映射表）。
 */
import type { BuildOptions } from 'vite'

export function createNewBuildConfig(isBuild: boolean): BuildOptions {
  return {
    /*
      minify:
      设置为 false 可以禁用最小化混淆，或是用来指定使用哪种混淆器。
      默认为 'oxc'（Oxc Minifier），它比 terser 快 30-90 倍，压缩率只差 0.5%-2%。
      'esbuild' 值已弃用；当设置为 'terser' 时必须先安装 Terser（pnpm i terser -D）。
      注意，在 lib 模式下使用 'es' 时，build.minify 选项不会缩减空格，因为会移除掉 pure 标注，导致破坏 tree-shaking。
    */
    minify: 'oxc', // 类型：boolean | 'oxc' | 'terser' | 'esbuild'，客户端构建默认为 'oxc'，SSR 构建默认为 false
    // 备选压缩器 terser（Vite 8 下仍可用）：需先安装 terser（pnpm i terser -D）
    // 切换方式：将上方 minify 改为 'terser' 并取消注释下方 terserOptions
    // minify: 'terser',
    // terserOptions: {
    //   // 在打包代码时移除 console、debugger 和注释
    //   compress: {
    //     drop_console: isBuild, // 生产环境时移除 console
    //     drop_debugger: isBuild // 默认 true
    //   },
    //   format: {
    //     comments: !isBuild // 开发环境保留注释，生产环境删除注释（terser 语义：true=保留注释，与 drop_console 相反，故取反）
    //   }
    // },
    // 把组件按组分块（Vite 8 使用 Rolldown，rollupOptions 已重命名为 rolldownOptions）
    rolldownOptions: {
      output: {
        // OXC 压缩器选项（等价于旧版 terserOptions），仅在 minify 为默认 'oxc' 时生效
        // 注意：OXC 压缩时默认移除全部注释（无对应配置项），旧版 format.comments 无需迁移
        // https://rolldown.rs/reference/OutputOptions.minify
        minify: {
          compress: {
            dropConsole: isBuild, // 等价于旧版 drop_console：生产环境时移除 console（camelCase，默认 false）
            dropDebugger: isBuild // 等价于旧版 drop_debugger：移除 debugger 语句（默认 true）
          }
        },
        // 打包优化（等价于旧版 manualChunks 的 vendors 分组）：将不常变动的第三方依赖包统一放到 vendors 包中，这样每次打包时，vendors 包都保持不变，从而实现缓存
        // Vite 8 中 output.manualChunks 已弃用，改用 Rolldown 的 codeSplitting.groups
        // 旧版 group-user 手动分组如仍需使用，在 groups 数组中追加对应分组即可，如：{ test: /src\/views\/User/, name: 'group-user' }
        // https://rolldown.rs/reference/OutputOptions.codeSplitting
        //
        // 【未来 vendors 包膨胀时的细分配置（预置，按需启用）】
        // 当 vendors 包显著增大（如 > 500 kB）或需要更细的缓存粒度时，取消下方注释并删除上方宽泛分组。
        // 注意：groups 按数组顺序匹配，命中即归组，故细分规则必须排在宽泛规则之前（或用 priority 字段控制）。
        // codeSplitting: {
        //   groups: [
        //     { test: /node_modules\/(vue|vue-router|pinia|@vueuse)/, name: 'vue-vendor' },
        //     { test: /node_modules\/ant-design-vue/, name: 'antd-vendor' },
        //     { test: /node_modules\/(axios|lodash-es|qs|date-fns)/, name: 'utils-vendor' },
        //     { test: /node_modules\/vue-amazing-ui/, name: 'amazing-vendor' },
        //     { test: /node_modules/, name: 'vendors' } // 兜底分组：其余第三方依赖
        //   ]
        // },
        codeSplitting: {
          groups: [
            {
              test: /node_modules/,
              name: 'vendors'
            }
          ]
        }
        // 处理使用中文命名的静态资源（例如：图片），以避免某些服务器不兼容中文命名的资源的情况
        // assetFileNames: (assetInfo) => {
        //   // console.log('assetInfo name', assetInfo.names[0])
        //   if (/[\u4e00-\u9fa5]/.test(assetInfo.names[0])) {
        //     return 'assets/[hash][extname]'
        //   }
        //   return 'assets/[name]-[hash][extname]'
        // }
      }
    }
    // 静态资源分类打包配置（等价于旧版 rollupOptions 静态资源分类块，如需启用请合并至上方 rolldownOptions.output）
    // https://vitejs.dev/config/build-options.html
    // rolldownOptions: {
    //   output: {
    //     entryFileNames: `js/[name]-[hash].js`, // 入口文件输出配置
    //     chunkFileNames: `js/[name]-[hash].js`, // 自定义命名代码分割中产生的 chunk
    //     assetFileNames: 'assets/[ext]/[name]-[hash].[ext]' // 静态资源分类打包
    //   }
    // }
  }
}
