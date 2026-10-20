// 全局主题色：唯一数据源
// App.vue 的 ConfigProvider 读取此 store，修改 primaryColor 后全站组件配色实时联动
// （组件库演示页已拆分至 vue-amazing-ui-demo，那里的 ColorPicker 同样复用本 store 结构）
export const useThemeStore = defineStore('theme', () => {
  const primaryColor = ref<string>('#ff6900')
  return { primaryColor }
})
