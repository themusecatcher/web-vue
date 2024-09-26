/**
 * Package file volume analysis
 */
import { visualizer } from 'rollup-plugin-visualizer'
import { type PluginOption } from 'vite'

export function configVisualizerPlugin() {
  return visualizer({
    filename: 'stats.html', // 类型 string 默认 stats.html
    open: true,
    template: 'treemap', // 类型 string 默认 treemap，可选：'sunburst', 'treemap', 'network', 'raw-data', 'list'
    gzipSize: true,
    brotliSize: true
  }) as PluginOption
}
