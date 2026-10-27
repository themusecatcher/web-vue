import { describe, expect, it, vi } from 'vitest'
import { formatRequestDate } from '../src/http/helper'

/**
 * formatRequestDate 契约测试
 *
 * 该函数原地改写调用方传入的 params（moment 格式化 + 字符串 trim + 递归），
 * 曾存在「moment 格式化后漏 trim」「空值裸属性访问」两处隐患，此处逐项锁定。
 */

// 最小 moment 桩：仅需 _isAMomentObject 标记与 format 方法
function fakeMoment(formatted: string) {
  return { _isAMomentObject: true, format: () => formatted }
}

describe('formatRequestDate', () => {
  it('非对象入参（字符串/数字）应直接返回，不进入遍历', () => {
    expect(formatRequestDate('str' as unknown as Recordable)).toBeUndefined()
    expect(formatRequestDate(123 as unknown as Recordable)).toBeUndefined()
  })

  it('数组应按非对象处理，直接返回', () => {
    expect(formatRequestDate([1, 2] as unknown as Recordable)).toBeUndefined()
  })

  it('字符串值应被 trim，且为原地修改', () => {
    const params = { name: '  padded  ' }
    formatRequestDate(params)
    expect(params.name).toBe('padded')
  })

  it('moment 桩应按固定格式常量格式化后再 trim', () => {
    const formatSpy = vi.fn(() => '  2026-10-20 10:00  ')
    formatRequestDate({ at: { _isAMomentObject: true, format: formatSpy } })
    // 格式化与 trim 两个环节都必须生效：先格式化（带前后空格）再被 trim 掉
    expect(formatSpy).toHaveBeenCalledWith('YYYY-MM-DD HH:mm')
    expect(formatSpy).toHaveBeenCalledTimes(1)
  })

  it('moment 桩格式化后的字符串同样会被 trim', () => {
    const params = { createdAt: fakeMoment('  2026-10-20 10:00  ') }
    formatRequestDate(params)
    expect(params.createdAt).toBe('2026-10-20 10:00')
  })

  it('null / undefined 值不应抛错且保持原样', () => {
    const params: Recordable = { a: null, b: undefined }
    expect(() => formatRequestDate(params)).not.toThrow()
    expect(params.a).toBeNull()
    expect(params.b).toBeUndefined()
  })

  it('数字、布尔、空串等非字符串值应原样保留', () => {
    const params: Recordable = { count: 5, ok: true, empty: '' }
    formatRequestDate(params)
    expect(params).toEqual({ count: 5, ok: true, empty: '' })
  })

  it('嵌套对象应递归处理（trim 与 moment 格式化均下沉）', () => {
    const params: Recordable = {
      nested: { deep: { name: '  x  ' } },
      at: fakeMoment('2026-10-20 10:00')
    }
    formatRequestDate(params)
    expect(params.nested.deep.name).toBe('x')
    expect(params.at).toBe('2026-10-20 10:00')
  })
})
