/**
 * imports component library styles on demand
 * https://github.com/vbenjs/vite-plugin-style-import
 */
import { type PluginOption } from 'vite'
import { createStyleImportPlugin } from 'vite-plugin-style-import'
import { VueAmazingUIStyleResolve } from 'vue-amazing-ui'

export function configStyleImportPlugin(): PluginOption {
  return createStyleImportPlugin({
    resolves:[
      VueAmazingUIStyleResolve()
    ]
  })
}
