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
  console.log(num)
  if (!isNumber(num)) {
    return '--'
  }
  var d = new Date(num)
  var fullYear = d.getFullYear()
  var month = toDouble(d.getMonth() + 1)
  var date = toDouble(d.getDate())
  var hour = toDouble(d.getHours())
  var minute = toDouble(d.getMinutes())
  var second = toDouble(d.getSeconds())
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
