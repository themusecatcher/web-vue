import { describe, it, expect } from 'vitest'
// 注意：App.vue 被显式引入并非多余——其模板使用 VueAmazingUIResolver 解析出的库组件
// （ConfigProvider / LoadingBarProvider / MessageProvider / ModalProvider / DialogProvider / NotificationProvider），
// 引入即把「自动导入 + 组件按需解析 + 样式副作用注入」整条管线拉进测试模块图。
// 这是测试环境对该管线的唯一覆盖，也是 vitest.config.ts 中 server.deps.inline: ['vue-amazing-ui'] 的存在意义
// （该配置缺失时会报 Unknown file extension ".css" for vue-amazing-ui/es/style/global.css，请勿删除本 import）。
import App from '../src/App.vue'
import router from '../src/router'

describe('应用冒烟', () => {
  it('App 组件与按需解析管线可正常加载', () => {
    // 断言 SFC 编译产物形态（setup / render 均由 @vitejs/plugin-vue 生成）：
    // 比 toBeDefined 更有鉴别力——管线异常时 import 到的往往不是正常组件对象
    expect(typeof App.setup).toBe('function')
    expect(typeof App.render).toBe('function')
  })

  it('路由表非空', () => {
    const all = router.getRoutes()
    console.log('total routes:', all.length)
    console.log('paths:', all.map((r) => r.path).join(', '))
    expect(all.length).toBeGreaterThan(0)
  })
})
