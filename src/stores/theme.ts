// 全局主题色：唯一数据源
// App.vue 的 ConfigProvider 与演示页侧边栏的主题色 ColorPicker 共用此 store，
// 修改 primaryColor 后全站组件配色实时联动
export const useThemeStore = defineStore('theme', () => {
  const primaryColor = ref<string>('#ff6900')
  return { primaryColor }
})
