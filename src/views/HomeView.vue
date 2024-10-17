<script setup lang="ts">
import storage from 'utils/storage' // 使用 storage
import { useTime } from 'hooks/useTime' // 使用 Time
storage.set('token', 'tokennnnn')
const { year, month, week, day, hour, minute, second } = useTime()
</script>
<template>
  <h1>Today is 周{{ week }}</h1>
  <h1>Date: {{ year }}-{{ month }}-{{ day }} {{ hour }}:{{ minute }}:{{ second }}</h1>
</template>
