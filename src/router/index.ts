import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
// import GlobalLayout from '@/layouts/GlobalLayout.vue'

export const routes = [
  {
    path: '/',
    name: 'home',
    meta: { title: '首页' },
    component: HomeView
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
