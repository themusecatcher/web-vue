<script setup lang="ts">
import { getAction } from 'apis/index'
import { ref, reactive, onBeforeMount } from 'vue'
import type { TableColumn, SwiperImage } from 'vue-amazing-ui'
const loading = ref<boolean>(false)
const queryParams = reactive({
  pageSize: 10,
  page: 1
})
const pagination = reactive({
  total: 0,
  showTotal: true
})
const columns = reactive<TableColumn[]>([
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: 'Age',
    dataIndex: 'age'
  },
  {
    title: 'Job',
    dataIndex: 'job',
    key: 'job'
  },
  {
    title: 'Sex',
    dataIndex: 'sex',
    key: 'sex'
  },
  {
    title: 'City',
    dataIndex: 'city'
  },
  {
    title: 'Action',
    width: 200,
    key: 'action'
  }
])
const dataSource = ref([])
onBeforeMount(() => {
  getData()
})
function getData() {
  loading.value = true
  getAction('/table/list', queryParams).then((res) => {
    console.log('res', res)
    if (res.code === 200) {
      const { result } = res
      dataSource.value = result.list
      pagination.total = result.total
      console.log('dataSource', dataSource)
    }
  }).finally(() => {
    loading.value = false
  })
}
function onChange(page: number, pageSize: number) {
  queryParams.page = page
  queryParams.pageSize = pageSize
  getData()
}
const images = ref<SwiperImage[]>([])
function loadImages() {
  for (let i = 1; i <= 6; i++) {
    images.value.push({
      name: `image-${i}`,
      src: `https://cdn.jsdelivr.net/gh/themusecatcher/resources@0.1.2/${i}.jpg`,
      link: `https://cdn.jsdelivr.net/gh/themusecatcher/resources@0.1.2/${i}.jpg`
    })
  }
}
onBeforeMount(() => {
  // 组件已完成响应式状态设置，但未创建DOM节点
  loadImages()
})
</script>
<template>
  <div style="margin: 60px 120px">
    <Swiper
      :images="images"
      :height="450"
      :speed="800"
      :pagination="{
        dynamicBullets: true,
        clickable: true
      }"
    />
    <Table
      bordered
      :columns="columns"
      :dataSource="dataSource"
      :pagination="pagination"
      :loading="loading"
      @change="onChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'name'">
          <a> hello {{ record.name }} </a>
        </template>
        <template v-else-if="column.key === 'sex'">
          <Tag v-if="record.sex === 'boy'" color="volcano">{{ record.sex }}</Tag>
          <Tag v-else-if="record.sex === 'girl'" color="magenta">{{ record.sex }}</Tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <span>
            <a>Invite {{ record.name }}</a>
            <Divider vertical />
            <a>Delete</a>
          </span>
        </template>
      </template>
    </Table>
  </div>
</template>
