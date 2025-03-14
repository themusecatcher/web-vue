/// <reference types="vite/client" />
declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const Component: DefineComponent<{}, {}, any>
  export default Component
}
interface Window {
  $message: any
}
declare module 'qs'
declare module 'lodash-es'
