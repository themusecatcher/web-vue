<script setup lang="ts">
const message = ref()
const theme = ref({
  common: {
    primaryColor: '#ff6900'
  }
})
onMounted(() => {
  window['$message'] = message.value
})
onBeforeUnmount(() => {
  delete window['$message']
})
function onClose() {
  // console.log('close')
}
</script>
<template>
  <ConfigProvider :theme="theme">
    <RouterView />
    <Message ref="message" @close="onClose" />
  </ConfigProvider>
</template>
