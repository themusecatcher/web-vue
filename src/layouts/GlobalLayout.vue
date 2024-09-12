<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { routes } from '@/router'

const route = useRoute() // 返回当前路由地址，相当于在模板中使用$route
// const router = useRouter() // 返回router实例，相当于在模板中使用$router

const menus = ref(routes[0].children)
const current = ref([route.name])
function onClick(e: any): void {
  console.log(`${e.item.title} ${e.key}`)
  // console.log(e.keyPath)
}
const routerViewRef = ref()
</script>
<template>
  <a-row style="width: 100%">
    <a-col :xs="5" :xl="4" style="position: relative">
      <a-menu class="m-menus" v-model:selectedKeys="current" mode="inline" @click="onClick">
        <a-menu-item v-for="menu in menus" :key="menu.name" :title="menu.meta.title">
          <router-link :to="menu.path">{{ menu.meta.title }} {{ menu.name }}</router-link>
        </a-menu-item>
      </a-menu>
    </a-col>
    <a-col :xs="19" :xl="20">
      <div class="router-view" ref="routerViewRef">
        <RouterView v-slot="{ Component }">
          <Transition name="fade" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
        <BackTop v-if="route.name !== 'BackTop'" />
      </div>
    </a-col>
  </a-row>
</template>
<style lang="less" scoped>
.m-menus {
  overflow-y: auto;
  height: 100vh;
}
.router-view {
  padding: 36px;
  overflow-y: auto;
  height: 100vh;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
