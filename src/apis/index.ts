import { http } from 'http/index'
import { ContentTypeEnum } from '@/enums/httpEnum'
export function getAction(url: string, params: object = {}, options: object = {}) {
  return http.request(
    {
      url: url,
      method: 'get',
      params: params
    },
    options
  )
}
export function postAction(url: string, params: object = {}, options: object = {}) {
  return http.request(
    {
      url: url,
      method: 'post',
      data: params,
      headers: {
        'Content-Type': ContentTypeEnum.FORM_DATA
      }
    },
    options
  )
}
export function postForm(url: string, params: object = {}, options: object = {}) {
  return http.request(
    {
      url,
      method: 'post',
      data: params,
      headers: {
        'Content-Type': ContentTypeEnum.FORM_DATA
      }
    },
    options
  )
}
