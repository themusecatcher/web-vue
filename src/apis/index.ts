import { http } from '@/utils/http/axios'
import { ContentTypeEnum } from '@/enums/httpEnum'
export function postForm(url: string, params: object) {
  return http.request({
    url,
    method: 'post',
    data: params,
    headers: {
      'Content-Type': ContentTypeEnum.FORM_DATA
    }
  })
}
export function getAction(url: string, params: object) {
  return http.request({
    url: url,
    method: 'get',
    params: params
  })
}
export function postAction(url: string, params: object) {
  return http.request({
    url: url,
    method: 'post',
    data: params,
    headers: {
      'Content-Type': ContentTypeEnum.FORM_DATA
    }
  })
}
