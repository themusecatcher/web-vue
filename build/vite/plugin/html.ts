/**
 * Plugin to minimize and use ejs template syntax in index.html.
 * https://github.com/anncwb/vite-plugin-html
 */
import { type PluginOption } from 'vite'
import { createHtmlPlugin } from 'vite-plugin-html'

// export function configHtmlPlugin(isBuild: boolean): PluginOption {
//   const htmlPlugin: PluginOption[] = createHtmlPlugin({
//     minify: isBuild
//   })
//   return htmlPlugin
// }

import pkg from '../../../package.json' with { type: 'json' }
import { GLOB_CONFIG_FILE_NAME } from '../../constant.ts'

export function configHtmlPlugin(env: ViteEnv, isBuild: boolean) {
  const { VITE_GLOB_APP_TITLE, VITE_PUBLIC_PATH } = env

  const path = VITE_PUBLIC_PATH.endsWith('/') ? VITE_PUBLIC_PATH : `${VITE_PUBLIC_PATH}/`

  const getAppConfigSrc = () => {
    return `${path || '/'}${GLOB_CONFIG_FILE_NAME}?v=${pkg.version}-${new Date().getTime()}`
  }
  const htmlPlugin: PluginOption[] = createHtmlPlugin({
    minify: isBuild,
    inject: {
      // Inject data into ejs template
      data: {
        title: VITE_GLOB_APP_TITLE
      },
      // Embed the generated app.config.js file
      tags: isBuild
        ? [
            {
              tag: 'script',
              attrs: {
                // type="module"：消除 Vite 8 对无 type script 的 "can't be bundled" 警告。
                // 执行顺序安全：该标签注入在 <head> 最前（早于 Vite 入口 module script），模块脚本按文档顺序 defer 执行，配置仍先于应用入口就绪。
                type: 'module',
                src: getAppConfigSrc()
              }
            }
          ]
        : []
    }
  })
  return htmlPlugin
}
