/// <reference types="vite/client" />
declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const Component: DefineComponent<object, object, any>
  export default Component
}
interface Window {
  $message: any
  $modal: any
}
declare module 'qs'
declare module 'lodash-es'
