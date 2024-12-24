<script setup lang="ts">
const message = ref()
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
  <RouterView />
  <Message ref="message" @close="onClose" />
</template>
