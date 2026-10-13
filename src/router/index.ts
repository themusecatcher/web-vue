import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
// import GlobalLayout from '@/layouts/GlobalLayout.vue'

/*
  vue-amazing-ui 组件演示路由（编译时收集，新增演示页无需手写路由）
  约定：src/views/amazing-ui/<kebab-case>/Index.vue 为演示页，index.ts 默认导出路由 meta
  路由 path 由目录推导：/amazing-ui/button、/amazing-ui/config-provider；
  name 转 PascalCase（短横线分段各自首字母大写）：AmazingUIButton、AmazingUIConfigProvider
*/
const demoComponents = import.meta.glob('../views/amazing-ui/*/Index.vue')
const demoMetas = import.meta.glob('../views/amazing-ui/*/index.ts', {
  eager: true, // 直接引入模块
  import: 'default' // 加载默认导出
})
const amazingRoutes: RouteRecordRaw[] = Object.entries(demoMetas).map(([path, meta]) => {
  const componentPath = path.replace('index.ts', 'Index.vue') // 打包过后目录结构不存在，不能用该变量直接作为组件导入路径
  // 去掉前导斜杠：子路由 path 必须是相对路径，若以 '/' 开头会被视为绝对路径、丢失 /amazing-ui 父级前缀
  const routePath = path.replace('../views/amazing-ui', '').replace('/index.ts', '').replace(/^\//, '') // button、config-provider
  // 路径转 PascalCase 作为路由 name（短横线分段各自首字母大写，如 config-provider → ConfigProvider），
  // 不加前缀，演示页标题 {{ $route.name }} 直接展示组件名；filter(Boolean) 去掉多余斜杠导致的空字符串
  const name = routePath
    .split('/')
    .filter(Boolean)
    .map((word) =>
      word
        .split('-')
        .filter(Boolean)
        .map((part) => `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}`)
        .join('')
    )
    .join('')
  return {
    path: routePath,
    name,
    meta,
    component: demoComponents[componentPath]
  } as RouteRecordRaw
})

export const routes = [
  {
    path: '/',
    name: 'home',
    meta: { title: '首页' },
    component: HomeView
  },
  {
    path: '/amazing-ui',
    name: 'AmazingUI',
    meta: { title: '组件库演示' },
    component: () => import('@/views/amazing-ui/Index.vue'),
    children: amazingRoutes
  },
  // {
  //   path: '/about',
  //   name: 'About',
  //   component: GlobalLayout,
  //   redirect: '/about/us',
  //   children: [
  //     {
  //       path: '/about/us',
  //       name: 'AboutUs',
  //       meta: { title: '关于我们' },
  //       // route level code-splitting
  //       // this generates a separate chunk (AboutView.[hash].js) for this route
  //       // which is lazy-loaded when the route is visited.
  //       component: () => import('@/views/AboutView.vue')
  //     }
  //   ]
  // },
  {
    path: '/:pathMatch(.*)*',
    // 如果你省略了最后的 `*`，在解析或跳转时，参数中的 `/` 字符将被编码
    // path: '/:pathMatch(.*)',
    name: 'not-found',
    meta: { title: 'NotFound' },
    component: () => import('@/views/exception/NotFound.vue')
  }
]

const router = createRouter({
  /**
   * 路由器使用的历史记录模式。大多数应用应该使用 createWebHistory，但这需要正确配置服务器。
   * 你也可以使用 createWebHashHistory 来实现基于 hash 的历史记录，无需配置服务器。但这种方式不会被搜索引擎处理，SEO 的效果较差。
   */
  history: createWebHistory(import.meta.env.BASE_URL), // 第一个参数 base: string 基准路径，它被预置到每个 URL 上。这允许在一个域名子文件夹中托管 SPA，例如将 base 设置为 /sub-folder 使得其托管在 example.com/sub-folder。
  routes, // `routes: routes` 的缩写
  // scrollBehavior(to, from, savedPosition) {}
  scrollBehavior() {
    // 滚动行为
    return { left: 0, top: 0, behavior: 'smooth' }
  }
})
// 注册全局前置守卫 (to, from) => {}
router.beforeEach((to) => {
  const domTitle = to.meta.title
  const appTitle = import.meta.env.VITE_GLOB_APP_TITLE
  document.title = `${domTitle} - ${appTitle}`
})

export default router
