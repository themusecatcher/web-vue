import type { Plugin, PluginOption } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
import { VueAmazingUIResolver } from 'vue-amazing-ui'

import { configCompressPlugin } from './compress'
import { configCDNImportPlugin } from './cdn'
import { configHtmlPlugin } from './html'
import { configVisualizerPlugin } from './visualizer'

export function createVitePlugins(viteEnv: ViteEnv, isBuild: boolean) {
  const { VITE_BUILD_COMPRESS, VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE, VITE_USE_CDN, VITE_ENABLE_ANALYZE } = viteEnv

  const vitePlugins: (Plugin | Plugin[] | PluginOption | PluginOption[])[] = [
    vue(),
    vueDevTools(),
    AutoImport({
      // dts: 'src/auto-imports.d.ts', // 自动引入生成的配置文件
      imports: ['vue', 'vue-router', 'pinia'],

      eslintrc: {
        enabled: true, // 默认false, true 启用。生成一次就可以，为避免每次工程启动都生成，一旦生成配置文件之后，可以把 enable 关掉
        filepath: './.eslintrc-auto-import.json', // 生成json文件,可以不配置该项，默认就是将生成在根目录
        globalsPropValue: true
      }
    }),
    // unplugin-vue-components 自动按需引入项目自定义组件和组件库的组件
    Components({
      // dts: 'src/components.d.ts', // 自动引入生成的配置文件
      // dirs: ['src/components'], // 配置需要默认导入的自定义组件文件夹，该文件夹下的所有组件都会自动 import
      // deep: true, // 深度扫描，默认 false
      resolvers: [
        AntDesignVueResolver({
          importStyle: false // css in js
        }),
        // auto import components from VueAmazingUI
        VueAmazingUIResolver()
      ]
    }),
  ]

  if (isBuild) {
    // rollup-plugin-gzip
    vitePlugins.push(configCompressPlugin(VITE_BUILD_COMPRESS, VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE))
  }

  // vite-plugin-cdn-import
  if (VITE_USE_CDN) {
    vitePlugins.push(configCDNImportPlugin())
  }

  // vite-plugin-html
  vitePlugins.push(configHtmlPlugin(viteEnv, isBuild))

  // rollup-plugin-visualizer
  if (VITE_ENABLE_ANALYZE) {
    vitePlugins.push(configVisualizerPlugin())
  }

  return vitePlugins
}
