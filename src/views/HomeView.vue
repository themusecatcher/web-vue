<script setup lang="ts">
onMounted(() => {
  // window.$message.success('点击了按钮')
  console.log('message', window.$message)
})
</script>
<template>
  <div style="margin: 60px 120px">
    <Button>按钮</Button>
  </div>
</template>
