import { isObject } from './is/index'

/**
 * 根据文件名和类型获取静态资源地址
 *
 * @param {string | number} name 图片文件的名称，可以是字符串或数字类型
 * @param {string} [type = 'png'] 图片文件的类型，默认为 'png'
 * @returns {string} 返回图片的完整 URL 地址
 */
export function getImageUrl(name: string | number, type: string = 'png'): string {
  return new URL(`../assets/images/${name}.${type}`, import.meta.url).href
}

/**
 * 深度合并两个对象
 *
 * 该函数的目的是将两个对象进行深度合并，意味着如果对象的属性值是另一个对象，
 * 则会递归地合并这些内部对象，而不是简单地覆盖它们
 *
 * @param {any} [src = {}] 源对象，将被合并的对象
 * @param {any} [target = {}] 目标对象，其属性将被合并到源对象中
 * @returns 返回合并后的对象，具有源对象和目标对象的所有属性
 */
export function deepMerge<T = any>(src: any = {}, target: any = {}): T {
  let key: string
  for (key in target) {
    src[key] = isObject(src[key]) ? deepMerge(src[key], target[key]) : (src[key] = target[key])
  }
  return src
}

/**
 * 检查给定的字符串是否是有效的 URL
 *
 * 该函数使用正则表达式来验证字符串是否以 http 或 https 协议开头，从而判断其是否可能是一个 URL
 * 这是一个简单的验证，仅检查 URL 的开头部分，并不检查域名的有效性或路径的正确性
 *
 * @param {string} url 待验证的字符串
 * @returns {boolean} 如果字符串可能是有效的 URL，则返回 true；否则返回 false
 */
export function isUrl(url: string): boolean {
  return /^(http|https):\/\//g.test(url)
}

/**
 * 将对象的属性转换为 URL 的查询参数并附加到 URL 上
 *
 * @param {string} baseUrl 待拼接查询参数的 url
 * @param {object} obj 查询参数对象
 * @returns {string} 返回包含查询参数的完整 URL
 *
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

/**
 * 获取 URL 中的参数
 *
 * 此函数旨在解析给定 URL 中的查询参数，并将其转换为一个键值对对象
 * 如果没有提供 URL，则使用当前页面的 URL 进行解析
 *
 * @param {string} url 可选；要解析的 URL，默认为当前页面的 URL
 * @returns {object} 返回一个包含 URL 查询参数的键值对对象
 */
export function getUrlParams(url?: string): object {
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
    params[key as string] = decodeURIComponent(value || '')
  })

  return params
}

/**
 * 防抖：连续触发时只保留最后一次调用，待停止触发满 `delay` 毫秒后执行
 *
 * 触发期间不断重置计时器，故连续高频触发只会执行最后一次；常用于输入、窗口 resize 等场景。
 *
 * @param fn - 需要防抖的函数
 * @param delay - 防抖等待时长（ms），默认 300
 * @returns 防抖后的包装函数；任何情况下都不返回值（原函数的返回值不向外传递）
 */
export function debounce(fn: Function, delay: number = 300): Function {
  let timer: any = null // 闭包持有定时器引用，便于重置
  return function (...args: any[]) {
    if (timer) {
      // 已有待执行任务则重置计时
      clearTimeout(timer)
    }
    // 重新计时，只有最后一次触发会真正执行
    timer = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

/**
 * 节流：同一窗口内最多执行一次——每轮窗口的首个调用立即执行，其后 `delay` 毫秒内的调用被直接丢弃
 *
 * 非周期性调度：窗口结束（`delay` 后）需再次调用才会执行，被丢弃的调用不会补发；常用于滚动 / 拖拽等高频事件。
 *
 * @param fn - 需要节流的函数
 * @param delay - 节流间隔（ms），默认 300
 * @returns 节流后的包装函数；窗口内被丢弃的调用返回 false，正常执行时不返回值（原函数的返回值不向外传递）
 */
export function throttle(fn: Function, delay: number = 300): Function {
  let valid = true // 当前是否处于可执行窗口
  return function (...args: any[]) {
    if (!valid) return false // 处于节流窗口内，直接忽略本次调用
    fn(...args) // 执行原函数
    valid = false // 关闭窗口，delay 后重新开启
    setTimeout(() => {
      valid = true
    }, delay)
  }
}
