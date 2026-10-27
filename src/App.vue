<script setup lang="ts">
import { computed } from 'vue'
import type { ConfigProviderTheme, MessageApi, ModalApi } from 'vue-amazing-ui'
import { useThemeStore } from '@/stores/theme'
// vue-amazing-ui@3.0.0 起 theme 结构为 { seed, mode, components }：
// 旧的 { common: { primaryColor } } 写法已移除，主色需放到 seed.primary，由组件库派生色阶与状态色
const themeStore = useThemeStore()
const theme = computed<ConfigProviderTheme>(() => ({
  seed: {
    primary: themeStore.primaryColor
  }
}))
// vue-amazing-ui@2.7.0 起 Message / Modal 改为 Provider 架构（命令式方法不再挂组件 ref）：
// <MessageProvider> / <ModalProvider> 挂载完成后通过 ready 事件回传 api（组件树内则用 useMessage() / useModal()），
// 此处挂到 window 供 axios 拦截器等 setup 外场景复用同一实例
function onMessageReady(api: MessageApi) {
  window.$message = api
}
function onModalReady(api: ModalApi) {
  window.$modal = api
}
onBeforeUnmount(() => {
  delete window.$message
  delete window.$modal
})
</script>
<template>
  <!-- abstract：3.0.0 起默认值由 true 改为 false，不传会渲染一层包裹元素且变量只写在该子树；
       本项目需要应用级主题（body / 页面链接等 html 级元素共用同一套变量），故显式开启 -->
  <ConfigProvider :theme="theme" abstract>
    <LoadingBarProvider>
      <MessageProvider @ready="onMessageReady">
        <ModalProvider @ready="onModalReady">
          <DialogProvider>
            <NotificationProvider>
              <RouterView />
            </NotificationProvider>
          </DialogProvider>
        </ModalProvider>
      </MessageProvider>
    </LoadingBarProvider>
  </ConfigProvider>
</template>
