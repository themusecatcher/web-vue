/// <reference types="vite/client" />
declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const Component: DefineComponent<object, object, any>
  export default Component
}
// 切勿为 qs / lodash-es 等自带类型的包添加无体 ambient module 声明（如 declare module 'qs'）：
// 无体声明优先级高于 node_modules 解析，会把整个模块降级为 any，抹掉全部类型安全。
