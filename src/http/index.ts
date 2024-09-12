import type { AxiosResponse } from 'axios'
import { VAxios } from './Axios'
import type { AxiosTransform, CreateAxiosOptions } from './axiosTransform'
import axios from 'axios'
import { checkStatus } from './checkStatus'
import { joinTimestamp, formatRequestDate } from './helper'
import { isString } from 'utils/is'
import { deepMerge, isUrl, setObjToUrlParams } from 'utils/index'
import { useGlobSetting } from 'hooks/setting'
import { RequestEnum, ContentTypeEnum, ConfigEnum } from 'enums/httpEnum'
// import { encryptData } from 'utils/signature/encrypt'
const globSetting = useGlobSetting()
const urlPrefix = globSetting.urlPrefix || ''
console.log('urlPrefix', urlPrefix)
/**
 * @description: 数据处理，方便区分多种处理方式
 */
const transform: AxiosTransform = {
  // 请求之前处理config
  beforeRequestHook: (config, options) => {
    console.log('before config', config)
    console.log('before options', options)
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
        // 给 get 请求加上时间戳参数，避免从缓存中拿数据。
        config.params = Object.assign(params || {}, joinTimestamp(joinTime, false))
      } else {
        // 兼容restful风格
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
        // 兼容restful风格
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
    // 请求之前处理config
    const token = null
    // console.log('config', config)
    // console.log('options', options)
    if (token && (config as Recordable)?.requestOptions?.withToken !== false) {
      // jwt token
      config.headers.Authorization = options.authenticationScheme ? `${options.authenticationScheme} ${token}` : token
      config.headers[ConfigEnum.TOKEN] = token
    }
    return config
  },
  /**
   * @description: 响应拦截器处理
   */
  responseInterceptors: (res: AxiosResponse<any>) => {
    console.log(res)
    return res.data
  },
  /**
   * @description: 响应错误处理
   */
  responseInterceptorsCatch: (error: any) => {
    const { response, code, message } = error || {}
    // TODO 此处要根据后端接口返回格式修改
    const msg: string = response && response.data && response.data.message ? response.data.message : ''
    const err: string = error.toString()
    try {
      if (code === 'ECONNABORTED' && message.indexOf('timeout') !== -1) {
        console.log('接口请求超时，请刷新页面重试!')
        return
      }
      if (err && err.includes('Network Error')) {
        console.log('网络异常，请检查您的网络连接是否正常')
        return Promise.reject(error)
      }
    } catch (error) {
      throw new Error(error as any)
    }
    // 请求是否被取消
    const isCancel = axios.isCancel(error)
    if (!isCancel) {
      checkStatus(error.response && error.response.status, msg)
    } else {
      console.warn(error, '请求被取消！')
    }
    //return Promise.reject(error);
    return Promise.reject(response?.data)
  }
}
function createAxios(opt?: Partial<CreateAxiosOptions>) {
  return new VAxios(
    deepMerge(
      {
        timeout: 30 * 1000,
        authenticationScheme: '',
        // 接口前缀
        prefixUrl: urlPrefix,
        headers: { 'Content-Type': ContentTypeEnum.JSON },
        transform,
        // 配置项，下面的选项都可以在独立的接口请求中覆盖
        requestOptions: {
          // 默认将prefix 添加到url
          joinPrefix: true,
          // 是否返回原生响应头 比如：需要获取响应头时使用该属性
          isReturnNativeResponse: false,
          // 需要对返回数据进行处理
          isTransformResponse: true,
          // post请求的时候添加参数到url
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
      },
      opt || {}
    )
  )
}

export const http = createAxios()
