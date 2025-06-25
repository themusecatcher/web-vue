/**
 * Provide local and prod mocks for vite.
 * https://github.com/vbenjs/vite-plugin-mock
 */
import { viteMockServe } from 'vite-plugin-mock'

export function configMockPlugin() {
  return viteMockServe({
    mockPath: 'mock', // 设置模拟 .ts 文件的存储文件夹 如果 watchFiles：true，将监视文件夹中的文件更改。并实时同步到请求结果 如果 configPath 具有值，则无效
    ignore: /^\_/, // 自动读取模拟 .ts 文件时，请忽略指定格式的文件
    watchFiles: true, // 设置是否监视 mockPath 对应的文件夹内文件中的更改
    enable: true, // 是否启用 mock 功能
    configPath: 'vite.mock.config.ts', // 设置模拟读取的数据条目。 当文件存在并且位于项目根目录中时，将首先读取并使用该文件。 配置文件返回一个数组
    logger: true // 是否在控制台显示请求日志
  })
}
