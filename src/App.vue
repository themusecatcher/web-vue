<script setup lang="ts">
import { computed } from 'vue'
import type { ConfigProviderTheme, MessageApi, ModalApi } from 'vue-amazing-ui'
import { useThemeStore } from '@/stores/theme'
// 主题色取自 theme store，侧边栏 ColorPicker 修改后全站组件配色实时联动
const themeStore = useThemeStore()
const theme = computed<ConfigProviderTheme>(() => ({
  common: {
    primaryColor: themeStore.primaryColor
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
  <ConfigProvider :theme="theme">
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
