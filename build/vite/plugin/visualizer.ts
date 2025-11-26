/**
 * Package file volume analysis
 * https://github.com/btd/rollup-plugin-visualizer
 */
import { type PluginOption } from 'vite'
import { visualizer } from 'rollup-plugin-visualizer'

export function configVisualizerPlugin(): PluginOption {
  return visualizer({
    filename: 'stats.html', // 类型 string 默认 stats.html
    open: true, // 自动打开分析页面
    template: 'treemap', // 类型 string 默认 treemap，可选：'sunburst', 'treemap', 'network', 'raw-data', 'list'
    gzipSize: true,
    brotliSize: true
  })
}
