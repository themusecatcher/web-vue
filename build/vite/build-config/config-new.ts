/**
 * 【新版本配置】Vite ≥ 8.x / Rolldown + OXC 时代构建配置（可立即使用）
 *
 * 环境依赖要求：
 * - Vite ≥ 8.x：底层打包器 Rolldown，压缩器默认 OXC（本配置通过 output.minify.compress 控制）
 * - Terser（备选）：minifier 切换为 'terser' 时需安装 `pnpm i terser -D`
 * - Node ≥ 20.19.0（见 package.json engines）
 *
 * 使用方式（统一出口为 build-config/index.ts）：
 *   createBuildConfig(isBuild, 'new') // 'new' 为默认值，可省略
 *
 * 本配置与旧版本（config-old.ts）的配置项对应关系见 config-old.ts 头部映射表。
 */
import type { BuildOptions } from 'vite'

export function createNewBuildConfig(isBuild: boolean): BuildOptions {
  /**
   * 压缩器（唯一切换点）：'oxc'（默认）| 'terser'（需先安装：pnpm i terser -D）| false（不压缩）
   * - 'oxc'：Rolldown 内置 Oxc Minifier 在 output.minify 阶段压缩，下方 output.minify 的选项生效；
   * - 'terser'：由 vite:terser 插件在 renderChunk 阶段压缩，此时下方 output.minify 会被自动跳过。
   *   若两者同时生效，OXC 先压一遍、terser 再压一遍（双重压缩：耗时与产物体积均无收益，且有语义风险）。
   */
  const minifier: 'oxc' | 'terser' | false = 'oxc'
  return {
    /*
      minify:
      设置为 false 可以禁用最小化混淆，或是用来指定使用哪种混淆器。
      默认为 'oxc'（Oxc Minifier），它比 terser 快 30-90 倍，压缩率只差 0.5%-2%。
      'esbuild' 在 Vite 8 下仍可用（需单独安装 esbuild），但官方已转向 Oxc，仅作兜底；
      当设置为 'terser' 时必须先安装 Terser（pnpm i terser -D），改上方 minifier 即可；
      此时 output.minify 会被跳过，如需移除 console/debugger 需启用下方 terserOptions。
      注意，在 lib 模式下使用 'es' 时，build.minify 选项不会缩减空格，因为会移除掉 pure 标注，导致破坏 tree-shaking。
    */
    minify: minifier, // 类型：boolean | 'oxc' | 'terser' | 'esbuild'，客户端构建默认为 'oxc'，SSR 构建默认为 false
    // 备选压缩器 terser（Vite 8 下仍可用）：需先安装 terser（pnpm i terser -D）
    // 将上方 minifier 改为 'terser' 后 output.minify 会被跳过；如需同时移除 console/debugger，
    // 取消下方 terserOptions 的注释（OXC 的 dropConsole 在 terser 模式下不生效）
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
        // OXC 压缩器选项（等价于旧版 terserOptions），仅在 minifier 为 'oxc' 时生效
        // 注意：OXC 压缩默认保留的注释范围由输出层的 comments / codegen.legalComments 控制，
        // 而 build.minify 为 'oxc' 时 Vite 已自动把 output.comments 的 jsdoc/legal/annotation 全部关掉，
        // 故旧版 format.comments 无需迁移；若需保留 license 注释，用 minify.codegen.legalComments 指定
        // 切换为 'terser' 时本段自动跳过，避免与 vite:terser 形成双重压缩
        // https://rolldown.rs/reference/OutputOptions.minify
        ...(minifier === 'oxc'
          ? {
              minify: {
                compress: {
                  dropConsole: isBuild, // 等价于旧版 drop_console：生产环境时移除 console（camelCase，默认 false）
                  dropDebugger: isBuild // 等价于旧版 drop_debugger：移除 debugger 语句（默认 true）
                }
              }
            }
          : {}),
        // 打包优化：把不常变动的第三方依赖包拆到独立分包中，这样每次打包时这些包保持不变，从而实现缓存
        // Vite 8 中 output.manualChunks 已弃用，改用 Rolldown 的 codeSplitting.groups
        // 旧版 group-user 手动分组如仍需使用，在 groups 数组中追加对应分组即可，如：{ test: /src\/views\/User/, name: 'group-user' }
        // https://rolldown.rs/reference/OutputOptions.codeSplitting
        //
        // 【分组依据：按「模块何时被需要」划分，不按「来自哪个 npm 包」划分】
        // groups 会把组内模块连同其独占依赖合并成一个 chunk，入口链用到组内任一模块，整包都会被首屏
        // modulepreload。因此只给「被所有 chunk 共享、升级频率低」的框架/工具库分组：当前为 vue 内核、
        // ant-design-vue、通用工具库三组；其余依赖交给引用图，仅懒加载路由用到的库随该路由 chunk 加载。
        // 新增分组前先确认该包确实出现在首屏链路上，否则会把懒加载代码固定成首屏预加载包。
        // 注意：groups 按数组顺序匹配、命中即归组（也可用 priority 控制）；正则统一用 `[\\/]` 匹配分隔符
        // 且包名后紧跟分隔符，避免前缀命中（如 vue 命中 vue-router、vue-amazing-ui 这类包）。
        codeSplitting: {
          groups: [
            // 框架内核（升级频率最低）
            { test: /[\\/]node_modules[\\/](?:vue|vue-router|pinia|@vueuse)[\\/]/, name: 'vue-vendor' },
            // 基础组件库（当前源码未直接使用 ant-design-vue，此规则留作模板预留：引入后自动成包）
            { test: /[\\/]node_modules[\\/]ant-design-vue[\\/]/, name: 'antd-vendor' },
            // 通用工具库
            { test: /[\\/]node_modules[\\/](?:axios|lodash-es|qs|date-fns)[\\/]/, name: 'utils-vendor' }
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
