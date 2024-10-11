/**
 * import cdn dependencies
 * https://github.com/MMF-FE/vite-plugin-cdn-import
 */
import { type PluginOption } from 'vite'
import cdn from 'vite-plugin-cdn-import'

export function configCDNImportPlugin(): PluginOption {
  return cdn({
    modules: [
      'vue',
      'vue-router',
      'axios'
      // {
      //   name: 'vue',
      //   var: 'Vue',
      //   path: 'https://cdn.jsdelivr.net/npm/vue@latest/dist/vue.global.min.js',
      // },
      // {
      //   name: 'axios',
      //   var: 'axios',
      //   path: 'https://cdn.jsdelivr.net/npm/axios@latest/dist/axios.min.js'
      // }
    ] // 预制依赖：react react-dom react-router-dom antd vue vue2 vue-router vue-router@3 moment dayjs axios lodash
  })
}
