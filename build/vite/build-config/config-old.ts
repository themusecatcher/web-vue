/**
 * 【旧版本配置】Vite ≤ 7.x / Rollup + esbuild 时代构建配置（可立即使用）
 *
 * 环境依赖要求：
 * - Vite ≤ 7.x：底层打包器为 Rollup，压缩器默认 esbuild
 *   （Vite 8 起已切换为 Rolldown，本配置中 rollupOptions 在 Vite 8 下为其弃用别名，
 *    v8.2.1 下仍可直接构建、无告警，但官方要求新代码改用 rolldownOptions）
 * - Terser：minify 使用 'terser' 时需安装 `pnpm i terser -D`
 * - Node ≥ 20.19.0（见 package.json engines）
 *
 * 使用方式（统一出口为 build-config/index.ts）：
 *   createBuildConfig(isBuild, 'old')
 *
 * 新旧配置等价映射表：
 * | 旧版本（本文件）                            | 新版本等价实现（config-new.ts）                           |
 * |---------------------------------------------|-----------------------------------------------------------|
 * | build.rollupOptions                         | build.rolldownOptions（旧名仅作别名保留，官方要求改用新名）|
 * | output.manualChunks（对象/函数形式）         | output.codeSplitting.groups                               |
 * | minify 默认 'esbuild'（快 terser 20-40 倍）  | minify 默认 'oxc'（快 terser 30-90 倍，'esbuild' 仍可作兜底）|
 * | terserOptions.compress.drop_console         | output.minify.compress.dropConsole（camelCase）            |
 * | terserOptions.compress.drop_debugger        | output.minify.compress.dropDebugger（camelCase）           |
 * | terserOptions.format.comments               | output.comments（Vite 按 build.minify 自动推导，无需手写）  |
 * | output.entryFileNames / chunkFileNames / assetFileNames | 同名配置，迁至 rolldownOptions.output 下           |
 *
 * 补充：新版注释策略无需迁移 format.comments —— build.minify 为 'oxc' 时 Vite 已把
 *       output.comments 的 jsdoc/legal/annotation 一并关闭；若需单独保留 license 注释，
 *       在 output.minify 中用 codegen.legalComments（'none' | 'inline' | 'eof' | 'external'）指定。
 */
import type { BuildOptions } from 'vite'

export function createOldBuildConfig(isBuild: boolean): BuildOptions {
  return {
    /*
      minify:
      设置为 false 可以禁用最小化混淆，或是用来指定使用哪种混淆器。
      默认为 'esbuild'，它比 terser 快 20-40 倍，压缩率只差 1%-2%。
      注意，在 lib 模式下使用 'es' 时，build.minify 选项不会缩减空格，因为会移除掉 pure 标注，导致破坏 tree-shaking。
      当设置为 'terser' 时必须先安装 Terser。（pnpm i terser -D）
    */
    minify: 'terser', // 类型：boolean | 'terser' | 'esbuild'，客户端构建默认为 'esbuild'，SSR 构建默认为 false，Vite 2.6.x 以上需要配置 minify: "terser", terserOptions 才能生效
    terserOptions: {
      // 在打包代码时移除 console、debugger 和 注释
      compress: {
        /* (default: false) -- Pass true to discard calls to console.* functions.
          If you wish to drop a specific function call such as console.info and/or
          retain side effects from function arguments after dropping the function
          call then use pure_funcs instead
        */
        /**
         * 如果在调试控制台中打印了某个对象，则调试控制台就持有了对该对象的引用，该对象就无法被回收了，会导致内存泄露
         * 经过验证，只有 devtools 打开时，console 打印才会引起内存泄漏的，如果不打开控制台，console 是不会引起内存变化的。
         */
        drop_console: isBuild, // 生产环境时移除 console
        drop_debugger: isBuild // 默认 true
      },
      format: {
        comments: !isBuild // 开发环境保留注释，生产环境删除注释（terser 语义：true=保留注释，与 drop_console 相反，故取反）
      }
    },
    // 把组件按组分块（Vite 7 使用 Rollup，通过 rollupOptions.output.manualChunks 配置）
    rollupOptions: {
      output: {
        // 打包优化，将不常变动的第三方依赖包统一放到独立分包中，这样每次打包时这些包保持不变，从而实现缓存
        // 与 config-new.ts 的 codeSplitting.groups 保持一致：只按「框架/工具」职责分组，其余依赖交给引用图
        // （不做 node_modules 兜底合并，否则会把仅懒加载路由用到的库固定成首屏预加载包）
        // 差异：manualChunks 只决定命中模块自身归哪个 chunk，不像 Rolldown 的 groups 那样连带吸入其独占依赖
        manualChunks: (id) => {
          if (!/[\\/]node_modules[\\/]/.test(id)) {
            return undefined
          }
          if (/[\\/]node_modules[\\/](?:vue|vue-router|pinia|@vueuse)[\\/]/.test(id)) {
            return 'vue-vendor'
          }
          if (/[\\/]node_modules[\\/]ant-design-vue[\\/]/.test(id)) {
            return 'antd-vendor'
          }
          if (/[\\/]node_modules[\\/](?:axios|lodash-es|qs|date-fns)[\\/]/.test(id)) {
            return 'utils-vendor'
          }
          return undefined
        }
        // 【可选：按依赖细化分组】当某类依赖需要独立缓存分包时，可将上方函数形式替换为下方对象形式：
        // manualChunks: {
        //   'vue-vendor': ['vue', 'vue-router', 'pinia', '@vueuse/core'],
        //   'antd-vendor': ['ant-design-vue'],
        //   'utils-vendor': ['axios', 'lodash-es', 'qs', 'date-fns']
        // }
        // 如需按页面/视图手动分组，使用对象形式（注意：路径须替换为项目实际视图文件，
        // 当前 src/views 下仅有 HomeView.vue、exception/，下方示例的 UserDetails 等文件并不存在）：
        // manualChunks: { // 代码分割
        //   'group-user': [ // 将以下相对路径指向的文件及其依赖打包到名为 group-user 的代码块中
        //     './src/views/UserDetails',
        //     './src/views/UserDashboard',
        //     './src/views/UserProfileEdit'
        //   ]
        // },
      }
    }
    // 静态资源分类打包配置 https://cn.vitejs.dev/config/build-options.html#build-rollupoptions
    // 如需启用请合并至上方 rollupOptions.output（与上方 rollupOptions 同层级配置，不可重复声明）：
    // rollupOptions: {
    //   output: {
    //     entryFileNames: `js/[name]-[hash].js`, // 入口文件输出配置
    //     chunkFileNames: `js/[name]-[hash].js`, // 自定义命名代码分割中产生的 chunk
    //     assetFileNames: 'assets/[ext]/[name]-[hash].[ext]' // 静态资源分类打包
    //   }
    // }
  }
}
