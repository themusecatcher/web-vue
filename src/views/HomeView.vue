<script setup lang="ts">
import storage from 'utils/storage' // 使用 storage
import { useTime } from 'hooks/useTime' // 使用 Time

storage.set('token', 'tokennnnn')
const { year, month, week, day, hour, minute, second } = useTime()

const listData = ref([
  {
    title: 'Vue Amazing UI Title 1',
    description: 'Vue Amazing UI, An Amazing Vue3 UI Components Library.',
    content: 'content'
  },
  {
    title: 'Vue Amazing UI Title 2',
    description: 'Vue Amazing UI, An Amazing Vue3 UI Components Library.',
    content: 'content'
  },
  {
    title: 'Vue Amazing UI Title 3',
    description: 'Vue Amazing UI, An Amazing Vue3 UI Components Library.',
    content: 'content'
  },
  {
    title: 'Vue Amazing UI Title 4',
    description: 'Vue Amazing UI, An Amazing Vue3 UI Components Library.',
    content: 'content'
  }
])
</script>
<template>
  <h1>Today is 周{{ week }}</h1>
  <h1>Date: {{ year }}-{{ month }}-{{ day }} {{ hour }}:{{ minute }}:{{ second }}</h1>
  <Button>按钮</Button>
  <FloatButton>
    <template #icon>😉</template>
  </FloatButton>
  <List>
    <ListItem v-for="(data, index) in listData" :key="index" :title="data.title">
      <template #avatar>
        <Avatar src="https://cdn.jsdelivr.net/gh/themusecatcher/resources@0.0.5/1.jpg" />
      </template>
      <template #description>
        {{ data.description }}
      </template>
    </ListItem>
  </List>
  <Tooltip tooltip="Tesla">
    <Button type="primary">特斯拉</Button>
  </Tooltip>
  <Popover title="Title">
    <template #content>
      <p>Content</p>
      <p>Content</p>
    </template>
    <Button type="primary">Hover me</Button>
  </Popover>
</template>
