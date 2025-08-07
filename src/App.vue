<script setup lang="ts">
const messageRef = useTemplateRef('messageRef')
const modalRef = useTemplateRef('modalRef')
const theme = ref({
  common: {
    primaryColor: '#ff6900'
  }
})
onMounted(() => {
  window['$message'] = messageRef.value
  window['$modal'] = modalRef.value
})
onBeforeUnmount(() => {
  delete window['$message']
  delete window['$modal']
})
</script>
<template>
  <ConfigProvider :theme="theme">
    <RouterView />
    <Message ref="messageRef" />
    <Modal ref="modalRef" />
  </ConfigProvider>
</template>
