import { warn } from './log'

/**
 * 图片资源映射
 *
 * 旧实现用动态 `new URL(`../assets/images/${name}.${type}`, import.meta.url)`：
 * Vite 8 能扫描该目录并在构建期生成映射（产物 URL 同样带哈希），但仍有两个问题：
 * 1. 文件不存在时映射取到 undefined，URL 指向不存在的路径 —— 页面静默 404，没有任何提示；
 * 2. 该能力依赖 Vite 对动态 new URL 的支持（Vite 4/5/6 无法在构建期解析，运行时会拼出错误路径）。
 *
 * 改为 glob 显式映射：URL 稳定可预期，缺文件时告警并返回空串，构建行为不依赖 Vite 版本。
 *
 * 注意：eager 会把匹配到的图片一并打进产物，请勿在该目录堆放不会被页面使用的临时素材。
 */
const imageModules = import.meta.glob<string>('../assets/images/**/*', {
  eager: true,
  query: '?url',
  import: 'default'
})

/**
 * 根据文件名和类型获取静态资源地址
 *
 * @param {string | number} name 图片文件的名称（不含目录与扩展名），可以是字符串或数字类型
 * @param {string} [type = 'png'] 图片文件的类型（扩展名），默认为 'png'
 * @returns {string} 返回图片的完整 URL 地址；文件不存在时告警并返回空串（不抛错，避免一张图缺失导致整块视图崩溃）
 */
export function getImageUrl(name: string | number, type: string = 'png'): string {
  const resourceKey = `../assets/images/${name}.${type}`
  const url = imageModules[resourceKey]
  if (!url) {
    warn(`图片资源不存在：src/assets/images/${name}.${type}`)
    return ''
  }
  return url
}

/**
 * 检查给定的字符串是否是有效的 URL
 *
 * 该函数使用正则表达式来验证字符串是否以 http 或 https 协议开头，从而判断其是否可能是一个 URL
 * 这是一个简单的验证，仅检查字符串的开头部分，并不检查域名的有效性或路径的正确性
 *
 * @param {string} url 待验证的字符串
 * @returns {boolean} 如果字符串可能是有效的 URL，则返回 true；否则返回 false
 */
export function isUrl(url: string): boolean {
  // 协议按大小写不敏感匹配：HTTP:// 与 http:// 等价。
  // 旧实现的 /g 无实际作用（字面量每次调用新建，不存在 lastIndex 残留），但大写协议会被误判为相对路径
  return /^https?:\/\//i.test(url)
}

/**
 * 查询参数值序列化
 *
 * 对象 / 数组序列化为 JSON：直接 `String(value)` 会得到 `[object Object]`、`1,2`，
 * 服务端无法解析且前端无从察觉。Date、File 等非普通对象仍走 `String()`，保持原有表现。
 */
function stringifyParamValue(value: unknown): string {
  const isPlainObject = Object.prototype.toString.call(value) === '[object Object]'
  if (Array.isArray(value) || isPlainObject) {
    try {
      return JSON.stringify(value)
    } catch {
      // 循环引用等无法序列化的值：降级为 String()，避免整个请求因序列化失败而中断
      return String(value)
    }
  }
  return String(value)
}

/**
 * 将对象的属性转换为 URL 的查询参数并附加到 URL 上
 *
 * 分隔符按目标 URL 的现状选择：以 `?` 结尾直接拼接、已有 `?` 用 `&`、否则补 `?`；
 * `#hash` 段原样保留，参数一律拼在 hash 之前的 query 段（拼在 `#` 之后浏览器不会发给服务端）；
 * 值为 `undefined` / `null` 的键直接跳过，避免发出 `a=undefined` 这类无效参数。
 *
 * 例子:
 *  let obj = {a: '3', b: '4'}
 *  setObjToUrlParams('www.baidu.com', obj)
 *  ==> www.baidu.com?a=3&b=4
 *
 * @param {string} baseUrl 待拼接查询参数的 url
 * @param {object} obj 查询参数对象
 * @returns 返回包含查询参数的完整 URL
 */
export function setObjToUrlParams(baseUrl: string, obj: object): string {
  const hashIndex = baseUrl.indexOf('#')
  const base = hashIndex === -1 ? baseUrl : baseUrl.slice(0, hashIndex)
  const hash = hashIndex === -1 ? '' : baseUrl.slice(hashIndex)

  const search = Object.entries(obj)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(stringifyParamValue(value))}`)
    .join('&')
  if (!search) return `${base}${hash}`

  let separator = '?'
  if (base.endsWith('?')) separator = ''
  else if (base.includes('?')) separator = '&'
  return `${base}${separator}${search}${hash}`
}

/**
 * 获取 URL 中的参数
 *
 * 此函数旨在解析给定 URL 中的查询参数，并将其转换为一个键值对对象
 * 如果没有提供 URL，则使用当前页面的 URL 进行解析
 *
 * @param {string} url 可选；要解析的 URL，默认为当前页面的 URL
 * @returns {Record<string, string>} 返回一个包含 URL 查询参数的键值对对象；同名参数取最后一个
 */
export function getUrlParams(url?: string): Record<string, string> {
  const target = url ?? (typeof window === 'undefined' ? '' : window.location.href)
  // 只看 query 段：hash 里的 `?` 属于前端路由，不是查询参数（旧实现会把 `#/route?b=2` 的 b 也解析出来）
  const hashIndex = target.indexOf('#')
  const withoutHash = hashIndex === -1 ? target : target.slice(0, hashIndex)
  const queryIndex = withoutHash.indexOf('?')
  if (queryIndex === -1) return {}

  const params: Record<string, string> = {}
  // URLSearchParams 负责 `+` → 空格的还原与 %XX 解码，遇到畸形百分号也不抛错
  // （旧实现直接 decodeURIComponent，`?q=100%` 会抛 URIError）
  new URLSearchParams(withoutHash.slice(queryIndex + 1)).forEach((value, key) => {
    if (key !== '') params[key] = value
  })
  return params
}
