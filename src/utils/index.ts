import { isObject } from './is/index'
// 获取静态资源地址
export function getImageUrl(name: any): string {
  return new URL(`../assets/images/${name}.jpg`, import.meta.url).href
}

// dynamic use hook props
export function deepMerge<T = any>(src: any = {}, target: any = {}): T {
  let key: string
  for (key in target) {
    src[key] = isObject(src[key]) ? deepMerge(src[key], target[key]) : (src[key] = target[key])
  }
  return src
}

/**
 * Sums the passed percentage to the R, G or B of a HEX color
 * @param {string} color The color to change
 * @param {number} amount The amount to change the color by
 * @returns {string} The processed part of the color
 */

/**
 * 判断是否 url
 * */
export function isUrl(url: string) {
  return /^(http|https):\/\//g.test(url)
}
/**
 * 将对象添加当作参数拼接到URL上面
 * @param baseUrl 需要拼接的url
 * @param obj 参数对象
 * @returns {string} 拼接后的对象
 * 例子:
 *  let obj = {a: '3', b: '4'}
 *  setObjToUrlParams('www.baidu.com', obj)
 *  ==>www.baidu.com?a=3&b=4
 */
export function setObjToUrlParams(baseUrl: string, obj: object): string {
  let parameters = ''
  let url = ''
  for (const key in obj) {
    parameters += key + '=' + encodeURIComponent(obj[key as keyof typeof obj]) + '&'
  }
  parameters = parameters.replace(/&$/, '')
  if (/\?$/.test(baseUrl)) {
    url = baseUrl + parameters
  } else {
    url = baseUrl.replace(/\/?$/, '?') + parameters
  }
  return url
}
export function getUrlParams(url?: string) {
  // 如果没有传入 URL，则使用当前页面的 URL
  url = url || window.location.href

  // 获取问号 (?) 之后的部分
  const queryString = url.split('?')[1]

  // 如果没有查询字符串，则返回空对象
  if (!queryString) return {}

  // 将查询字符串转换为键值对
  const params: any = {}
  queryString.split('&').forEach((param) => {
    const [key, value] = param.split('=')
    params[key] = decodeURIComponent(value)
  })

  return params
}
