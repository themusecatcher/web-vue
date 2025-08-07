<script setup lang="ts">
function onClick() {
  window.$message.success('点击了按钮')
}
</script>
<template>
  <div style="margin: 60px 120px">
    <Button @click="onClick">按钮</Button>
  </div>
</template>
