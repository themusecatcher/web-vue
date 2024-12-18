<script setup lang="ts">
import { Button, Result } from 'vue-amazing-ui'
import 'vue-amazing-ui/es/button/Button.css'
import 'vue-amazing-ui/es/result/Result.css'
</script>
<template>
  <Result status="404" title="404" sub-title="Sorry, the page you visited does not exist.">
    <template #extra>
      <Button type="primary" href="/">Back Home</Button>
    </template>
  </Result>
</template>
