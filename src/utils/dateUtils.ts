import { format } from 'date-fns'
import { isNumber } from './is'
const DATE_TIME_FORMAT = 'yyyy-MM-dd HH:mm:ss'
const DATE_FORMAT = 'yyyy-MM-dd'
// 时间补0
export function toDouble(iNum: number) {
  return iNum < 10 ? '0' + iNum : iNum
}
export function formatToDateTime(date: Date | number, formatStr = DATE_TIME_FORMAT): string {
  return format(date, formatStr)
}

export function formatToDate(date: Date | number, formatStr = DATE_FORMAT): string {
  return format(date, formatStr)
}
/*
 * 时间戳格式化成日期格式
 */
export function formatDateMs(num: number, type: number): string {
  if (!isNumber(num)) {
    return '--'
  }
  const d = new Date(num)
  const fullYear = d.getFullYear()
  const month = toDouble(d.getMonth() + 1)
  const date = toDouble(d.getDate())
  const hour = toDouble(d.getHours())
  const minute = toDouble(d.getMinutes())
  const second = toDouble(d.getSeconds())
  switch (type) {
    case 1:
      return fullYear + '-' + month + '-' + date + ' ' + hour + ':' + minute + ':' + second
    case 2:
      return fullYear + '-' + month + '-' + date
    case 3:
      return fullYear + '/' + month + '/' + date
    case 4:
      return hour + ':' + minute + ':' + second
    case 5:
      return fullYear.toString()
    case 6:
      return month.toString()
    case 7:
      return date.toString()
    case 8:
      return fullYear + '-' + month + '-' + date + ' ' + hour + ':' + minute
    default:
      return fullYear + '年' + month + '月' + date + '日'
  }
}
