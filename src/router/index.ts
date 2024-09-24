import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import GlobalLayout from '@/layouts/GlobalLayout.vue'

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
  history: createWebHistory(import.meta.env.BASE_URL), // 使用history模式，hash模式：createWebHashHistory
  routes, // `routes: routes` 的缩写
  scrollBehavior(to, from, savedPosition) {
    // 滚动行为
    return { left: 0, top: 0, behavior: 'smooth' }
  }
})
// 注册全局前置守卫
router.beforeEach((to, from) => {
  const domTitle = to.meta.title
  const appTitle = import.meta.env.VITE_GLOB_APP_TITLE
  document.title = `${domTitle} - ${appTitle}`
})

export default router
