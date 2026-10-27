import { isObject, isString } from 'utils/is'

const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm'

export function joinTimestamp<T extends boolean>(join: boolean, restful: T): T extends true ? string : object

export function joinTimestamp(join: boolean, restful = false): string | object {
  if (!join) {
    return restful ? '' : {}
  }
  const now = new Date().getTime()
  if (restful) {
    return `?_t=${now}`
  }
  return { _t: now }
}

/**
 * @description: Format request parameter time
 */
export function formatRequestDate(params: Recordable) {
  if (Object.prototype.toString.call(params) !== '[object Object]') {
    return
  }

  for (const key in params) {
    const current = params[key]
    if (current?._isAMomentObject) {
      params[key] = current.format(DATE_TIME_FORMAT)
    }
    // 注意：此处需重新读取，moment 对象可能已在上面被格式化为字符串
    const value = params[key]
    if (isString(value)) {
      params[key] = value.trim()
    }
    if (isObject(params[key])) {
      formatRequestDate(params[key])
    }
  }
}
