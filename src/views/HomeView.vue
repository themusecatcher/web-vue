<script setup lang="ts">
import { Flex, GradientText } from 'vue-amazing-ui'
</script>
<template>
  <Flex style="padding: 60px" justify="center">
    <GradientText
      :size="36"
      :weight="500"
      :gradient="{
        deg: '90deg',
        from: '#09c8ce',
        to: '#eb2f96'
      }"
    >
      欢迎使用 web-vue 模板项目
    </GradientText>
  </Flex>
</template>
