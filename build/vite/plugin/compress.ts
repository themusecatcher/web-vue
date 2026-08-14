/**
 * Used to package and output gzip/brotli
 * https://github.com/nonzzz/vite-plugin-compression
 *
 * 注：Vite 8 使用 Rolldown，原 vite-plugin-compression（2022 年停更）产出的 .gz 文件路径错误
 * （拼接为绝对路径 dist//Users/...），故迁移至 vite-plugin-compression2
 */
import type { Plugin } from 'vite'
import { compression } from 'vite-plugin-compression2'

export function configCompressPlugin(compress: 'gzip' | 'brotli' | 'none', deleteOriginalAssets = false): Plugin[] {
  const compressList = compress.split(',')

  const plugins: Plugin[] = []

  if (compressList.includes('gzip')) {
    plugins.push(
      compression({
        threshold: 1025, // 类型 number，默认 0，只压缩大于此值的资源。单位按字节计算
        algorithms: ['gzip'], // 类型 string[]，默认 ['gzip', 'brotliCompress']，可选 'gzip'、'brotliCompress'、'deflate'、'deflateRaw'、'zstandard'（压缩产物后缀由算法决定：gzip -> .gz，brotliCompress -> .br）
        deleteOriginalAssets // 类型 boolean，默认 false，在压缩之后是否删除原文件。建议保留原始资源以备回退
      })
    )
  }
  if (compressList.includes('brotli')) {
    plugins.push(
      compression({
        threshold: 1025, // 与 gzip 分支保持一致，统一跳过小于 1KB 的资源
        algorithms: ['brotliCompress'], // brotli 算法，压缩产物后缀为 .br
        deleteOriginalAssets
      })
    )
  }
  return plugins
}
