// @vitest-environment node
import { describe, it, expect } from 'vitest'
// 该文件在 node 环境运行（无 localStorage / document），用于锁定 SSR 安全性：
// 模块顶层一旦访问浏览器全局，这里 import 阶段就会抛 ReferenceError
import defaultStorage, { Storage } from '../src/utils/storage'

describe('Storage - SSR / Node 环境', () => {
  it('导入模块不应因缺少 localStorage 而抛错', () => {
    expect(typeof Storage).toBe('function')
    expect(defaultStorage).toBeDefined()
  })

  it('缺少浏览器全局时读写应静默降级', () => {
    const storage = new Storage('')
    expect(() => storage.set('k', 'v')).not.toThrow()
    expect(storage.get('k', 'def')).toBe('def')
    expect(() => storage.clear()).not.toThrow()
    expect(storage.getCookie('c')).toBe('')
    expect(() => storage.setCookie('c', 'v')).not.toThrow()
  })
})
