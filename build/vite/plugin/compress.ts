/**
 * Used to package and output gzip. Note that this does not work properly in Vite, the specific reason is still being investigated
 * https://github.com/anncwb/vite-plugin-compression
 */
import type { Plugin } from 'vite'
import viteCompression from 'vite-plugin-compression'

export function configCompressPlugin(
  compress: 'gzip' | 'brotli' | 'none',
  deleteOriginFile = false
): Plugin | Plugin[] {
  const compressList = compress.split(',')

  const plugins: Plugin[] = []

  if (compressList.includes('gzip')) {
    plugins.push(
      viteCompression({
        verbose: true, // 类型：boolean，是否在控制台输出压缩结果
        filter: /\.(js|mjs|json|css|html)$/i, // 指定哪些资源不被压缩
        threshold: 1025, // 类型 number，默认 1025B，只压缩大于此值的资源。单位按字节计算
        algorithm: 'gzip', // 类型 string，默认 'gzip'，可选 'gzip','brotliCompress' ,'deflate','deflateRaw'
        ext: '.gz',
        deleteOriginFile // 类型 boolean，默认 undefined，在压缩之后是否删除原文件。建议保留原始资源以备回退
      })
    )
  }
  if (compressList.includes('brotli')) {
    plugins.push(
      viteCompression({
        ext: '.br',
        algorithm: 'brotliCompress',
        deleteOriginFile
      })
    )
  }
  return plugins
}
