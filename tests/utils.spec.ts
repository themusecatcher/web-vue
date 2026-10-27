import { describe, it, expect, vi } from 'vitest'
import { getImageUrl, getUrlParams, isUrl, setObjToUrlParams } from '../src/utils/index'
import { formatDateMs } from '../src/utils/dateUtils'

/**
 * 通用工具函数契约测试
 *
 * 锁定 URL / 时间戳工具的历史缺陷修复：协议大小写、hash 与 query 的边界、
 * 畸形百分号、数字字符串时间戳、无效时间戳等「出错时静默返回错误值」的分支。
 */

describe('isUrl', () => {
  it('应识别 http / https 绝对地址', () => {
    expect(isUrl('http://a.com/list')).toBe(true)
    expect(isUrl('https://a.com/list')).toBe(true)
  })

  it('协议大小写不应影响判断', () => {
    expect(isUrl('HTTPS://a.com')).toBe(true)
  })

  it('相对路径与其它协议应返回 false', () => {
    expect(isUrl('/api/list')).toBe(false)
    expect(isUrl('api/list')).toBe(false)
    expect(isUrl('ftp://a.com')).toBe(false)
  })

  it('同一入参重复调用结果应稳定', () => {
    expect(isUrl('https://a.com')).toBe(true)
    expect(isUrl('https://a.com')).toBe(true)
  })
})

describe('setObjToUrlParams', () => {
  it('无查询参数时应补 ?', () => {
    expect(setObjToUrlParams('www.a.com/list', { a: 3, b: 4 })).toBe('www.a.com/list?a=3&b=4')
  })

  it('已有查询参数时应使用 &', () => {
    expect(setObjToUrlParams('/api?x=1', { a: 3 })).toBe('/api?x=1&a=3')
  })

  it('以 ? 结尾时不应重复分隔符', () => {
    expect(setObjToUrlParams('/api?', { a: 3 })).toBe('/api?a=3')
  })

  it('参数应拼在 hash 之前的 query 段', () => {
    // 拼在 # 之后浏览器不会把参数发给服务端
    expect(setObjToUrlParams('/api/list#section', { a: 1 })).toBe('/api/list?a=1#section')
  })

  it('undefined / null 应跳过，避免发出 a=undefined', () => {
    expect(setObjToUrlParams('/api', { a: undefined, b: null, c: 1 })).toBe('/api?c=1')
  })

  it('全部参数被跳过时不应留下多余分隔符', () => {
    expect(setObjToUrlParams('/api', { a: undefined })).toBe('/api')
  })

  it('键名应编码', () => {
    expect(setObjToUrlParams('/api', { 'a b': 1 })).toBe('/api?a%20b=1')
  })

  it('嵌套对象应按 JSON 序列化而非 [object Object]', () => {
    expect(setObjToUrlParams('/api', { filter: { id: 1 } })).toBe(`/api?filter=${encodeURIComponent('{"id":1}')}`)
  })

  it('值无法序列化（循环引用）时不应抛错', () => {
    const circular: Record<string, unknown> = {}
    circular.self = circular
    expect(() => setObjToUrlParams('/api', { c: circular })).not.toThrow()
  })
})

describe('getUrlParams', () => {
  it('应解析基础参数', () => {
    expect(getUrlParams('/p?a=1&b=2')).toEqual({ a: '1', b: '2' })
  })

  it('加号应还原为空格', () => {
    expect(getUrlParams('/p?q=a+b')).toEqual({ q: 'a b' })
  })

  it('中文应解码', () => {
    expect(getUrlParams(`/p?n=${encodeURIComponent('中文')}`)).toEqual({ n: '中文' })
  })

  it('hash 不应混入参数值', () => {
    expect(getUrlParams('/p?a=1#/route?b=2')).toEqual({ a: '1' })
  })

  it('畸形百分号不应抛错', () => {
    expect(getUrlParams('/p?q=100%')).toEqual({ q: '100%' })
  })

  it('同名参数取最后一个', () => {
    expect(getUrlParams('/p?a=1&a=2')).toEqual({ a: '2' })
  })

  it('无 query 时返回空对象', () => {
    expect(getUrlParams('/p')).toEqual({})
  })

  it('不传参时应回退到当前页面地址且不抛错', () => {
    expect(getUrlParams()).toEqual(expect.any(Object))
  })
})

describe('formatDateMs', () => {
  // 用本地时间构造，避免用例受运行环境时区影响
  const timestamp = new Date(2026, 0, 5, 8, 9, 10).getTime()

  it('应按 type 输出对应格式', () => {
    expect(formatDateMs(timestamp, 1)).toBe('2026-01-05 08:09:10')
    expect(formatDateMs(timestamp, 2)).toBe('2026-01-05')
    expect(formatDateMs(timestamp, 3)).toBe('2026/01/05')
    expect(formatDateMs(timestamp, 4)).toBe('08:09:10')
    expect(formatDateMs(timestamp, 5)).toBe('2026')
    expect(formatDateMs(timestamp, 6)).toBe('01')
    expect(formatDateMs(timestamp, 7)).toBe('05')
    expect(formatDateMs(timestamp, 8)).toBe('2026-01-05 08:09')
    expect(formatDateMs(timestamp, 99)).toBe('2026年01月05日')
  })

  it('应支持后端返回的数字字符串时间戳', () => {
    expect(formatDateMs(String(timestamp), 2)).toBe('2026-01-05')
  })

  it('无效时间戳应返回 --', () => {
    expect(formatDateMs('', 2)).toBe('--')
    expect(formatDateMs('abc', 2)).toBe('--')
    expect(formatDateMs(Number.NaN, 2)).toBe('--')
    expect(formatDateMs(Number.POSITIVE_INFINITY, 2)).toBe('--')
  })
})

describe('getImageUrl', () => {
  it('图片不存在时应告警并返回空串而非抛错', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(getImageUrl('not-exist')).toBe('')
    expect(warnSpy).toHaveBeenCalled()
    warnSpy.mockRestore()
  })
})
