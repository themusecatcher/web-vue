/**
 * Inspect the intermediate state of Vite plugins
 * https://github.com/antfu/vite-plugin-inspect
 *
 * 仅在 dev 模式下启用（dev 默认 true，build 默认 false），
 * 访问 http://localhost:端口/__inspect/ 查看插件中间状态
 */
import Inspect from 'vite-plugin-inspect'
import type { PluginOption } from 'vite'

export function configInspectPlugin(): PluginOption {
  return Inspect()
}
