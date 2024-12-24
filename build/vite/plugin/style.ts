/**
 * imports component library styles on demand
 * https://github.com/vbenjs/vite-plugin-style-import
 */
import { type PluginOption } from 'vite'
import { createStyleImportPlugin } from 'vite-plugin-style-import'

export function configStyleImportPlugin(): PluginOption {
  return createStyleImportPlugin({
    libs: [
      {
        libraryName: 'vue-amazing-ui', // 需要导入的库名
        libraryNameChangeCase: 'pascalCase', // 'pascalCase': 帕斯卡命名法，每个单词的首字母大写，不使用分隔符；默认 'paramCase'，导出的名称转换格式
        // esModule: true, // 默认 false，如果样式文件不是 .css 后缀。需要开启此选项
        resolveStyle: (componentName: string) => {
          return `vue-amazing-ui/es/${componentName.toLocaleLowerCase()}/${componentName}.css`
        }
      }
    ]
  })
}
