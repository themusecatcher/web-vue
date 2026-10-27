import type { AxiosResponse } from 'axios'
import { VAxios } from './axios'
import type { AxiosTransform, CreateAxiosOptions } from './axiosTransform'
import axios from 'axios'
import merge from 'lodash-es/merge'
import { checkStatus } from './checkStatus'
import { joinTimestamp, formatRequestDate } from './helper'
import { isString } from 'utils/is'
import { isUrl, setObjToUrlParams } from 'utils/index'
import { useGlobSetting } from 'hooks/setting'
import { RequestEnum, ContentTypeEnum } from 'enums/httpEnum'
// import { encryptData } from 'utils/signature/encrypt'
const globSetting = useGlobSetting()
const urlPrefix = globSetting.urlPrefix || ''
/**
 * @description: 数据处理，方便区分多种处理方式
 */
const transform: AxiosTransform = {
  // 请求之前处理 config
  beforeRequestHook: (config, options) => {
    // if (config.method === 'get') {
    //   config.params = encryptData(config)
    // } else {
    //   config.data = encryptData(config)
    // }
    const { apiUrl, joinPrefix, joinParamsToUrl, formatDate, joinTime = true, urlPrefix } = options

    const isUrlStr = isUrl(config.url as string)

    if (!isUrlStr && joinPrefix) {
      config.url = `${urlPrefix}${config.url}`
    }

    if (!isUrlStr && apiUrl && isString(apiUrl)) {
      config.url = `${apiUrl}${config.url}`
    }
    const params = config.params || {}
    const data = config.data || false
    if (config.method?.toUpperCase() === RequestEnum.GET) {
      if (!isString(params)) {
        // 给 get 请求加上时间戳参数，避免从缓存中拿数据
        config.params = Object.assign(params || {}, joinTimestamp(joinTime, false))
      } else {
        // 兼容 restful 风格
        config.url = config.url + params + `${joinTimestamp(joinTime, true)}`
        config.params = undefined
      }
    } else {
      if (!isString(params)) {
        formatDate && formatRequestDate(params)
        if (Reflect.has(config, 'data') && config.data && Object.keys(config.data).length > 0) {
          config.data = data
          config.params = params
        } else {
          config.data = params
          config.params = undefined
        }
        if (joinParamsToUrl) {
          config.url = setObjToUrlParams(config.url as string, Object.assign({}, config.params, config.data))
        }
      } else {
        // 兼容 restful 风格
        config.url = config.url + params
        config.params = undefined
      }
    }
    return config
  },
  /**
   * @description: 请求拦截器处理
   */
  requestInterceptors: (config, options) => {
    // 请求之前处理 config
    // TODO: 接入登录态后在此读取 token 并注入，参考：
    // if (token && (config as Recordable)?.requestOptions?.withToken !== false) {
    //   ;(config.headers as Recordable).Authorization = options.authenticationScheme
    //     ? `${options.authenticationScheme} ${token}`
    //     : token
    //   ;(config.headers as Recordable)['X-Access-Token'] = token
    // }
    return config
  },
  /**
   * @description: 响应拦截器处理
   */
  responseInterceptors: (res: AxiosResponse<any>) => {
    // console.log(res)
    return res.data
  },
  /**
   * @description: 响应错误处理
   */
  responseInterceptorsCatch: (error: any) => {
    const { response, code, message } = error || {}
    // TODO 此处要根据后端接口返回格式修改
    const msg: string = response?.data?.message ? response.data.message : ''
    // error 为空值时兜底，避免这一行成为整段处理中唯一会抛错的地方
    const err: string = String(error ?? '')
    // 用 includes 而非 indexOf(...) !== -1：message 缺失时前者为 undefined（falsy），
    // 不会像后者那样恒真而把超时判断退化成只判 code
    if (code === 'ECONNABORTED' && message?.includes('timeout')) {
      console.log('接口请求超时，请刷新页面重试!')
      return Promise.reject(error)
    }
    if (err && err.includes('Network Error')) {
      console.log('网络异常，请检查您的网络连接是否正常')
      return Promise.reject(error)
    }
    // 请求是否被取消
    const isCancel = axios.isCancel(error)
    if (!isCancel) {
      checkStatus(error?.response?.status, msg)
    } else {
      console.warn(error, '请求被取消！')
    }
    //return Promise.reject(error);
    // 网络层错误（无 response）时不能 reject(undefined)：调用方 catch 后访问 e.message 会二次崩溃。
    // 有响应体时保持既有契约（reject 业务返回体），无响应体则退回 reject 原始 error
    return Promise.reject(response?.data ?? error)
  }
}
// 默认配置：显式标注类型，避免对象字面量的字面量类型被宽化成 string 后无法赋值给 CreateAxiosOptions
const defaultOptions: CreateAxiosOptions = {
  timeout: 30 * 1000,
  authenticationScheme: '',
  headers: { 'Content-Type': ContentTypeEnum.JSON },
  transform,
  // 配置项，下面的选项都可以在独立的接口请求中覆盖
  requestOptions: {
    // 默认将 prefix 添加到url
    joinPrefix: true,
    // 是否返回原生响应头 比如：需要获取响应头时使用该属性
    isReturnNativeResponse: false,
    // 需要对返回数据进行处理
    isTransformResponse: true,
    // post 请求的时候添加参数到 url
    joinParamsToUrl: false,
    // 格式化提交参数时间
    formatDate: true,
    // 消息提示类型
    errorMessageMode: 'none',
    // 接口地址
    apiUrl: globSetting.apiUrl,
    // 接口拼接地址
    urlPrefix: urlPrefix,
    //  是否加入时间戳
    joinTime: true,
    // 忽略重复请求
    ignoreCancelToken: true,
    // 是否携带token
    withToken: true
  },
  withCredentials: true
}

function createAxios(opt?: Partial<CreateAxiosOptions>) {
  // 用 lodash merge 代替自研 deepMerge：
  // - source 为 undefined 时不覆盖默认值，符合「局部覆盖」的配置语义
  // - 已内置 __proto__ / constructor 原型污染防护
  // 注意：lodash merge 对数组按下标合并（[9] 合入 [1,2,3] 得到 [9,2,3]），
  // 后续给配置项加数组类型时需显式整体替换，否则会残留默认项
  return new VAxios(merge(defaultOptions, opt || {}))
}

export const http = createAxios()
