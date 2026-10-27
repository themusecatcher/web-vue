export function checkStatus(status?: number, msg = ''): void {
  const $message = window.$message
  // 无响应体（网络层错误，调用方已 console 提示）时直接跳过，避免弹出空 toast
  if (status === undefined) {
    return
  }
  switch (status) {
    case 400:
      $message?.error(msg)
      break
    // 401: 未登录
    // 未登录则跳转登录页面，并携带当前页面的路径
    // 在登录成功后返回当前页面，这一步需要在登录页操作。
    case 401:
      $message?.error('用户没有权限（令牌、用户名、密码错误）!')
      break
    case 403:
      $message?.error('用户得到授权，但是访问是被禁止的。!')
      break
    // 404请求不存在
    case 404:
      $message?.error('网络请求错误，未找到该资源!')
      break
    case 405:
      $message?.error('网络请求错误，请求方法未允许!')
      break
    case 408:
      $message?.error('网络请求超时')
      break
    case 500:
      $message?.error('服务器错误,请联系管理员!')
      break
    case 501:
      $message?.error('网络未实现')
      break
    case 502:
      $message?.error('网络错误')
      break
    case 503:
      $message?.error('服务不可用，服务器暂时过载或维护!')
      break
    case 504:
      $message?.error('网络超时')
      break
    case 505:
      $message?.error('http版本不支持该请求!')
      break
    default:
      // 后端未返回 message 时兜底，避免弹出空白 toast
      $message?.error(msg || '请求失败，请稍后重试!')
  }
}
