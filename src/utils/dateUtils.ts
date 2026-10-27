import { format } from 'date-fns'

const DATE_TIME_FORMAT = 'yyyy-MM-dd HH:mm:ss'
const DATE_FORMAT = 'yyyy-MM-dd'

export function formatToDateTime(date: Date | number, formatStr = DATE_TIME_FORMAT): string {
  return format(date, formatStr)
}

export function formatToDate(date: Date | number, formatStr = DATE_FORMAT): string {
  return format(date, formatStr)
}

/**
 * 时间戳转换为合法 Date
 *
 * 兼容后端把时间戳序列化成字符串的情形（旧实现用 isNumber 严格判定类型，
 * `'1699999999999'` 会被直接判为无效返回 '--'）；空串、非数字、NaN、Infinity 一律视为无效。
 */
function toValidDate(timestamp: number | string): Date | null {
  if (typeof timestamp === 'string' && timestamp.trim() === '') return null
  const numeric = typeof timestamp === 'string' ? Number(timestamp) : timestamp
  if (!Number.isFinite(numeric)) return null
  const date = new Date(numeric)
  return Number.isNaN(date.getTime()) ? null : date
}

/**
 * 时间戳格式化成日期格式
 *
 * 补齐位数交给 date-fns 的 format（旧实现的 toDouble 与 formatToDateTime 属两套逻辑，
 * 且对 >= 10 的数值返回 number、< 10 返回 string，返回类型不稳定）
 *
 * @param {number | string} timestamp 毫秒级时间戳
 * @param {number} type 输出格式：1 `yyyy-MM-dd HH:mm:ss`、2 `yyyy-MM-dd`、3 `yyyy/MM/dd`、
 *                      4 `HH:mm:ss`、5 年、6 月、7 日、8 `yyyy-MM-dd HH:mm`，其它值返回 `yyyy年MM月dd日`
 * @returns {string} 格式化结果；时间戳无效（空串 / 非数字 / NaN / Infinity）时返回 '--'
 */
export function formatDateMs(timestamp: number | string, type: number): string {
  const date = toValidDate(timestamp)
  if (!date) return '--'

  switch (type) {
    case 1:
      return format(date, DATE_TIME_FORMAT)
    case 2:
      return format(date, DATE_FORMAT)
    case 3:
      return format(date, 'yyyy/MM/dd')
    case 4:
      return format(date, 'HH:mm:ss')
    case 5:
      return format(date, 'yyyy')
    case 6:
      return format(date, 'MM')
    case 7:
      return format(date, 'dd')
    case 8:
      return format(date, 'yyyy-MM-dd HH:mm')
    default:
      return format(date, 'yyyy年MM月dd日')
  }
}
