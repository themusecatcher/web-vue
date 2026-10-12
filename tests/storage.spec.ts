import { describe, it, expect, beforeEach } from 'vitest'
// 注意：默认导出是实例（new Storage('')），类本身为命名导出
import defaultStorage, { Storage } from '../src/utils/storage'

/**
 * Storage 缓存契约测试
 *
 * storage.ts 是模板项目中被 api 层间接依赖的基础设施，其过期清理、JSON 容错、
 * key 归一（前缀 + 大写）行为属于「看不见的坑」——出错时表现为缓存莫名不命中，
 * 此处逐项锁定契约（含边界与兜底分支）。
 */

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

  it('key 应拼接前缀并大写后存入', () => {
    const prefixed = new Storage('APP_')
    prefixed.set('token', 'v')
    expect(localStorage.getItem('APP_TOKEN')).not.toBeNull()
  })

  it('读取不存在的 key 应返回调用方默认值', () => {
    expect(storage.get('missing', 'fallback')).toBe('fallback')
    expect(storage.get('missing')).toBeNull()
  })

  it('存储内容损坏（非法 JSON）时应返回默认值而非抛错', () => {
    localStorage.setItem('BAD', '{oops')
    expect(storage.get('bad', 'fallback')).toBe('fallback')
  })

  it('已过期的条目应被清理并返回默认值', () => {
    // expire 传负值使过期时间早于当前时刻，覆盖 get 内的过期分支
    storage.set('temp', 'v', -1)
    expect(storage.get('temp', 'fallback')).toBe('fallback')
    expect(localStorage.getItem('TEMP')).toBeNull()
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
    expect(sessionStorage.getItem('S_K')).not.toBeNull()
    expect(localStorage.getItem('S_K')).toBeNull()
    sessionStorage.clear()
  })

  it('默认导出实例应可直接使用', () => {
    defaultStorage.set('singleton', 1)
    expect(defaultStorage.get('singleton')).toBe(1)
  })
})

describe('Storage - Cookie 操作', () => {
  let storage: Storage

  beforeEach(() => {
    // 逐个过期清理，避免用例间通过 cookie jar 互相污染
    document.cookie.split('; ').forEach((cookie) => {
      const name = cookie.split('=')[0]
      if (name) {
        document.cookie = `${name}=; Max-Age=0`
      }
    })
    storage = new Storage('')
  })

  it('setCookie 后 getCookie 应取回值', () => {
    storage.setCookie('theme', 'dark')
    expect(storage.getCookie('theme')).toBe('dark')
  })

  it('cookie 名同样走前缀大写归一', () => {
    const prefixed = new Storage('APP_')
    prefixed.setCookie('lang', 'zh')
    expect(document.cookie).toContain('APP_LANG=zh')
    expect(prefixed.getCookie('lang')).toBe('zh')
  })

  it('removeCookie 后应取不到值', () => {
    storage.setCookie('theme', 'dark')
    storage.removeCookie('theme')
    expect(storage.getCookie('theme')).toBe('')
  })

  it('getCookie 对不存在的 name 应返回空串', () => {
    expect(storage.getCookie('not-exist')).toBe('')
  })

  it('clearCookie 应清空所有 cookie', () => {
    storage.setCookie('a', '1')
    storage.setCookie('b', '2')
    storage.clearCookie()
    expect(document.cookie).toBe('')
  })
})
