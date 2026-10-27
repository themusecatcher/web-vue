import { describe, it, expect, beforeEach, vi } from 'vitest'
// 注意：默认导出是实例（new Storage('')），类本身为命名导出
import defaultStorage, { Storage } from '../src/utils/storage'
import type { StorageLike } from '../src/utils/storage'

/**
 * Storage 缓存契约测试
 *
 * storage.ts 是模板项目中被 api 层间接依赖的基础设施，其过期清理、JSON 容错、
 * key 归一（前缀 + 原样键名）行为属于「看不见的坑」——出错时表现为缓存莫名不命中，
 * 此处逐项锁定契约（含边界与兜底分支）。
 */

/** 清空当前页面可见的 cookie：必须带 Path，否则与写入路径不一致时删不掉 */
function clearCookies(): void {
  document.cookie.split('; ').forEach((cookie) => {
    const name = cookie.split('=')[0]
    if (name) document.cookie = `${name}=; Max-Age=0; Path=/`
  })
}

/** 构造可控的底层存储替身，用于模拟隐私模式 / 配额满等异常 */
function createBrokenStore(overrides: Partial<StorageLike> = {}): StorageLike {
  return {
    length: 0,
    key: () => null,
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    ...overrides
  }
}

describe('Storage - localStorage 读写', () => {
  let storage: Storage
  beforeEach(() => {
    localStorage.clear()
    storage = new Storage('')
  })

  it('set 后 get 应原样取回值', () => {
    storage.set('token', 'abc123')
    expect(storage.get('token')).toBe('abc123')
  })

  it('对象等结构化数据应完整往返', () => {
    const value = { name: '测试', tags: [1, 2, 3] }
    storage.set('user', value)
    expect(storage.get('user')).toEqual(value)
  })

  it('key 应拼接前缀原样存入，不做大小写归一', () => {
    const prefixed = new Storage('APP_')
    prefixed.set('token', 'v')
    expect(localStorage.getItem('APP_token')).not.toBeNull()
    // 大小写不同的键不能撞车
    prefixed.set('Token', 'upper')
    expect(prefixed.get('token')).toBe('v')
    expect(prefixed.get('Token')).toBe('upper')
  })

  it('读取不存在的 key 应返回调用方默认值', () => {
    expect(storage.get('missing', 'fallback')).toBe('fallback')
    expect(storage.get('missing')).toBeNull()
  })

  it('存储内容损坏（非法 JSON）时应返回默认值而非抛错', () => {
    localStorage.setItem('bad', '{oops')
    expect(storage.get('bad', 'fallback')).toBe('fallback')
  })

  it('已过期的条目应被清理并返回默认值', () => {
    // expire 传负值使过期时间早于当前时刻，覆盖 get 内的过期分支
    storage.set('temp', 'v', -1)
    expect(storage.get('temp', 'fallback')).toBe('fallback')
    expect(localStorage.getItem('temp')).toBeNull()
  })

  it('expire 为 null 时应永不过期', () => {
    storage.set('forever', 'v', null)
    expect(storage.get('forever')).toBe('v')
  })

  it('remove 应精确删除目标条目', () => {
    storage.set('a', 1)
    storage.set('b', 2)
    storage.remove('a')
    expect(storage.get('a')).toBeNull()
    expect(storage.get('b')).toBe(2)
  })

  it('clear 应清空整个存储', () => {
    storage.set('a', 1)
    storage.set('b', 2)
    storage.clear()
    expect(localStorage.length).toBe(0)
  })

  it('构造参数应支持注入 sessionStorage', () => {
    sessionStorage.clear()
    const session = new Storage('S_', sessionStorage)
    session.set('k', 'v')
    expect(sessionStorage.getItem('S_k')).not.toBeNull()
    expect(localStorage.getItem('S_k')).toBeNull()
    sessionStorage.clear()
  })

  it('默认导出实例应可直接使用', () => {
    defaultStorage.set('singleton', 1)
    expect(defaultStorage.get('singleton')).toBe(1)
  })
})

describe('Storage - 容错与命名空间', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('底层读取抛错（隐私模式）时应返回默认值而非抛出', () => {
    const storage = new Storage(
      '',
      createBrokenStore({
        getItem: () => {
          throw new Error('SecurityError')
        }
      })
    )
    expect(storage.get('k', 'def')).toBe('def')
  })

  it('底层写入抛错（配额满）时不应抛出', () => {
    const storage = new Storage(
      '',
      createBrokenStore({
        setItem: () => {
          throw new Error('QuotaExceededError')
        }
      })
    )
    expect(() => storage.set('k', 'v')).not.toThrow()
  })

  it('值无法 JSON 序列化（循环引用）时不应抛出', () => {
    const storage = new Storage('')
    const circular: Record<string, unknown> = {}
    circular.self = circular
    expect(() => storage.set('circular', circular)).not.toThrow()
    expect(storage.get('circular', 'def')).toBe('def')
  })

  it('set undefined 等价于删除该键', () => {
    const storage = new Storage('')
    storage.set('u', 'v')
    storage.set('u', undefined)
    expect(storage.get('u', 'def')).toBe('def')
  })

  it('遇到非本工具写入的数据应返回默认值且不删除原数据', () => {
    const storage = new Storage('')
    localStorage.setItem('raw', JSON.stringify({ a: 1 }))
    expect(storage.get('raw', 'def')).toBe('def')
    expect(localStorage.getItem('raw')).toBe(JSON.stringify({ a: 1 }))
  })

  it('TTL 为 NaN 时应回落默认时长而非写入失效条目', () => {
    const storage = new Storage('')
    storage.set('k', 'v', Number.NaN)
    expect(storage.get('k')).toBe('v')
  })

  it('带前缀的 clear 只删除本命名空间的键', () => {
    const app = new Storage('app:')
    const other = new Storage('other:')
    app.set('a', 1)
    other.set('b', 2)
    app.clear()
    expect(app.get('a')).toBeNull()
    expect(other.get('b')).toBe(2)
  })

  it('TTL 为 Infinity 时应回落默认时长而非写入失效条目', () => {
    const storage = new Storage('')
    storage.set('k', 'v', Number.POSITIVE_INFINITY)
    expect(storage.get('k')).toBe('v')
  })

  it('expire 字段非法（非数字）时应视为损坏并清理该条目', () => {
    const storage = new Storage('')
    localStorage.setItem('bad-expire', JSON.stringify({ value: 'v', expire: 'tomorrow' }))
    expect(storage.get('bad-expire', 'def')).toBe('def')
    expect(localStorage.getItem('bad-expire')).toBeNull()
  })
})

describe('Storage - Cookie 操作', () => {
  beforeEach(() => {
    // 逐个过期清理，避免用例间通过 cookie jar 互相污染
    clearCookies()
  })

  it('setCookie 后 getCookie 应取回值', () => {
    const storage = new Storage('')
    storage.setCookie('theme', 'dark')
    expect(storage.getCookie('theme')).toBe('dark')
  })

  it('cookie 名同样拼接前缀且保持原样大小写', () => {
    const prefixed = new Storage('APP_')
    prefixed.setCookie('lang', 'zh')
    expect(document.cookie).toContain('APP_lang=zh')
    expect(prefixed.getCookie('lang')).toBe('zh')
  })

  it('removeCookie 后应取不到值', () => {
    const storage = new Storage('')
    storage.setCookie('theme', 'dark')
    storage.removeCookie('theme')
    expect(storage.getCookie('theme')).toBe('')
  })

  it('getCookie 对不存在的 name 应返回空串', () => {
    const storage = new Storage('')
    expect(storage.getCookie('not-exist')).toBe('')
  })

  it('clearCookie 应清空当前命名空间的 cookie', () => {
    const storage = new Storage('')
    storage.setCookie('a', '1')
    storage.setCookie('b', '2')
    storage.clearCookie()
    expect(storage.getCookie('a')).toBe('')
    expect(storage.getCookie('b')).toBe('')
  })

  it('cookie 值含中文与分号、等号时应原样往返', () => {
    const storage = new Storage('')
    storage.setCookie('t', 'a;b=c中文')
    expect(storage.getCookie('t')).toBe('a;b=c中文')
  })

  it('带前缀的 clearCookie 不应波及其它命名空间的 cookie', () => {
    const app = new Storage('app:')
    const other = new Storage('other:')
    app.setCookie('token', '1')
    other.setCookie('token', '2')
    app.clearCookie()
    expect(app.getCookie('token')).toBe('')
    expect(other.getCookie('token')).toBe('2')
  })

  it('removeCookie 的 path 与写入不一致时删不掉（锁定 path 契约）', () => {
    const storage = new Storage('')
    storage.setCookie('x', '1')
    storage.removeCookie('x', '/other')
    expect(storage.getCookie('x')).toBe('1')
    storage.removeCookie('x')
    expect(storage.getCookie('x')).toBe('')
  })

  it('他人 cookie 的值含等号时不应影响本命名空间的清理', () => {
    const app = new Storage('app:')
    const other = new Storage('other:')
    app.setCookie('token', '1')
    other.setCookie('token', '2')
    // 值含 `=` 的他人 cookie：按 `xxx=` 正则解析会额外产生并不存在的名字
    document.cookie = 'plain=x=y; Path=/'
    app.clearCookie()
    expect(app.getCookie('token')).toBe('')
    expect(other.getCookie('token')).toBe('2')
  })

  it('SameSite=None 未开 secure 时应告警并自动补 Secure', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const storage = new Storage('')
    storage.setCookie('n', '1', { sameSite: 'None' })
    expect(warnSpy).toHaveBeenCalled()
    warnSpy.mockRestore()
  })
})
