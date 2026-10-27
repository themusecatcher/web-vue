<script setup lang="ts">
import type { MessageApi } from 'vue-amazing-ui'
import { useThemeStore } from '@/stores/theme'
// 主题（种子主色 + 明暗模式）统一由 theme store 派生：vue-amazing-ui@3.0.0 起 theme 结构为
// { seed, mode, components }，store 内已是 computed，此处直接消费，不再二次组装，避免主题规则散落在组件里
const themeStore = useThemeStore()
// vue-amazing-ui@2.7.0 起 Message / Modal 改为 Provider 架构（命令式方法不再挂组件 ref）：
// <MessageProvider> 挂载完成后通过 ready 事件回传 api，此处挂到 window 供 axios 拦截器等
// setup 外场景复用同一实例；组件内调用直接 useMessage()，无需经过 window。
// Modal 目前没有 setup 外调用方，故不挂 window —— 组件内仍可正常 useModal()。
function onMessageReady(api: MessageApi) {
  window.$message = api
}
onBeforeUnmount(() => {
  delete window.$message
})
</script>
<template>
  <ConfigProvider :theme="themeStore.theme" abstract>
    <LoadingBarProvider>
      <ModalProvider>
        <DialogProvider>
          <NotificationProvider>
            <MessageProvider @ready="onMessageReady">
              <RouterView />
            </MessageProvider>
          </NotificationProvider>
        </DialogProvider>
      </ModalProvider>
    </LoadingBarProvider>
  </ConfigProvider>
</template>
