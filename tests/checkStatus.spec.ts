import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { checkStatus } from '../src/http/checkStatus'

/**
 * checkStatus 契约测试
 *
 * window.$message 由 App.vue 的 MessageProvider（vue-amazing-ui）ready 回传后挂载，
 * 供 axios 拦截器等组件外场景调用。「status 缺失跳过」「后端 message 缺失兜底」
 * 「$message 未挂载不抛错」三条路径在此锁定。
 */
describe('checkStatus', () => {
  let errorSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    errorSpy = vi.fn()
    // $message 真实类型为 antd MessageInstance，测试仅消费 error 方法
    window.$message = { error: errorSpy } as unknown as Window['$message']
  })

  afterEach(() => {
    delete window.$message
  })

  it('status 为 undefined（网络层错误）时不应弹 toast', () => {
    checkStatus(undefined, 'network down')
    expect(errorSpy).not.toHaveBeenCalled()
  })

  // 400 分支透传调用方 msg（单独用例锁定），此处仅收固定文案分支
  const STATUS_CASES: [number, string][] = [
    [401, '用户没有权限（令牌、用户名、密码错误）!'],
    [403, '用户得到授权，但是访问是被禁止的。!'],
    [404, '网络请求错误，未找到该资源!'],
    [405, '网络请求错误，请求方法未允许!'],
    [408, '网络请求超时'],
    [500, '服务器错误,请联系管理员!'],
    [501, '网络未实现'],
    [502, '网络错误'],
    [503, '服务不可用，服务器暂时过载或维护!'],
    [504, '网络超时'],
    [505, 'http版本不支持该请求!']
  ]

  STATUS_CASES.forEach(([status, expected]) => {
    it(`${status} 应展示对应文案`, () => {
      checkStatus(status, '后端消息')
      expect(errorSpy).toHaveBeenCalledWith(expected)
    })
  })

  it('400 分支应透传后端 message', () => {
    checkStatus(400, '参数格式错误')
    expect(errorSpy).toHaveBeenCalledWith('参数格式错误')
  })

  it('default 分支有 msg 时应展示 msg', () => {
    checkStatus(418, 'teapot')
    expect(errorSpy).toHaveBeenCalledWith('teapot')
  })

  it('default 分支 msg 为空串时应兜底，避免空白 toast', () => {
    checkStatus(418, '')
    expect(errorSpy).toHaveBeenCalledWith('请求失败，请稍后重试!')
  })

  it('$message 未挂载时任何分支都不应抛错', () => {
    delete window.$message
    expect(() => checkStatus(500, 'x')).not.toThrow()
    expect(() => checkStatus(undefined, 'x')).not.toThrow()
  })
})
