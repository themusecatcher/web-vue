import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from './router'
// 全局基础样式（reset + body/a + 间距工具类）：统一在此引入一次，确保首屏（含首页）即生效。
// 不要改回 vite.config.ts 的 css.preprocessorOptions.additionalData 注入——该文件会产出 CSS，
// 经 additionalData 会被复制进每个 less/scss 块：scoped 下整体失效（如 body[data-v-x] 永不命中），
// 非 scoped 下又产生多份全局重复（曾达 37 份）。
import './assets/less/global.less'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.mount('#app')
