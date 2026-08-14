/**
 * Inspect the intermediate state of Vite plugins
 * https://github.com/antfu/vite-plugin-inspect
 *
 * 仅在 dev 模式下启用（dev 默认 true，build 默认 false），
 * 访问 http://localhost:端口/__inspect/ 查看插件中间状态
 */
import Inspect from 'vite-plugin-inspect'
import type { Plugin, PluginOption } from 'vite'
import chalk from 'chalk'

export function configInspectPlugin(): PluginOption {
  return [Inspect(), printInspectUrlPlugin()]
}

/**
 * vite-plugin-inspect 12.x 不再向终端打印访问地址，用户无法感知插件已启用。
 * 仿照 vite-plugin-vue-devtools 的做法包裹 server.printUrls，
 * 在 dev 启动时追加一行 Inspect 访问提示
 */
function printInspectUrlPlugin(): Plugin {
  return {
    name: 'inspect-url-hint',
    apply: 'serve',
    configureServer(server) {
      const _printUrls = server.printUrls
      const colorUrl = (url: string) =>
        chalk.cyan(url.replace(/:(\d+)\//, (_, port: string) => `:${chalk.bold(port)}/`))
      server.printUrls = () => {
        _printUrls()
        for (const url of server.resolvedUrls?.local ?? []) {
          const inspectUrl = url.endsWith('/') ? `${url}__inspect/` : `${url}/__inspect/`
          const hint = `Open ${colorUrl(inspectUrl)} to inspect Vite plugins`
          console.log(`  ${chalk.green('➜')}  ${chalk.bold('Inspect')}: ${chalk.green(hint)}`)
        }
      }
    }
  }
}
