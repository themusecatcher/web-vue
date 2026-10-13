<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { ItemType, MenuKey } from 'vue-amazing-ui'
import pkg from 'vue-amazing-ui/package.json'
import { useThemeStore } from '@/stores/theme'
import { demoComponentCount, demoGroups } from './config'
import './demo.global.scss'

const route = useRoute()
const router = useRouter()

// 全局主题色：ColorPicker 修改后经 App.vue 的 ConfigProvider 实时生效
const themeStore = useThemeStore()

const basePath = '/amazing-ui'

/** 侧边菜单数据：按分组组织，key 即目标路由 path */
const menuItems = computed<ItemType[]>(
  () =>
    demoGroups.map((group) => ({
      key: `group-${group.title}`,
      label: group.title,
      type: 'group',
      children: group.components.map((component) => ({
        key: `${basePath}/${component.key}`,
        label: `${component.name} ${component.title}`
      }))
    })) as ItemType[]
)

/** 当前选中项跟随路由 */
const selectedKeys = computed<MenuKey[]>(() => [route.path])

/** 默认展开全部分组，用户也可手动折叠 */
const openKeys = ref<MenuKey[]>(demoGroups.map((group) => `group-${group.title}`))

function onSelect(info: { key: MenuKey }) {
  const path = String(info.key)
  if (path !== route.path) {
    router.push(path)
  }
}

/** BackTop 排除项：这两个演示页自身展示对应组件，避免同页出现两个实例（对齐官方演示工程） */
const hideBackTop = computed(() => ['BackTop', 'ConfigProvider'].includes(String(route.name)))

/**
 * BackTop 滚动监听目标：内容区滚动容器（Scrollbar 内部的 .scrollbar-container）
 * BackTop 经 Teleport 挂载到 body，默认沿 DOM 向上只能找到 documentElement，
 * 而本布局为容器内滚动、页面自身不滚动，不显式指定时按钮永远不会显示
 */
const getContentScrollTarget = (): HTMLElement | Document =>
  document.querySelector<HTMLElement>('.demo-content-scroll .scrollbar-container') ?? document.documentElement
</script>

<template>
  <Row class="demo-row">
    <Col class="demo-menu-col" :xs="5" :xl="4">
      <div class="demo-menu-header">
        <div class="demo-menu-title-row">
          <span class="demo-menu-title">Vue Amazing UI</span>
          <Tag class="demo-menu-version" size="small" color="volcano" :bordered="false">v{{ pkg.version }}</Tag>
        </div>
        <span class="demo-menu-count">共 {{ demoComponentCount }} 个组件</span>
        <div class="demo-menu-theme">
          <span class="demo-menu-theme-label">主题色</span>
          <span class="demo-theme-swatch" :style="{ backgroundColor: themeStore.primaryColor }" />
          <ColorPicker :width="140" v-model:value="themeStore.primaryColor" />
        </div>
      </div>
      <Scrollbar class="demo-menu-scroll">
        <Menu
          class="demo-menu"
          mode="inline"
          :items="menuItems"
          :selected-keys="selectedKeys"
          :open-keys="openKeys"
          @select="onSelect"
        />
      </Scrollbar>
    </Col>
    <Col class="demo-content-col" :xs="19" :xl="20">
      <Scrollbar class="demo-content-scroll">
        <div class="router-view">
          <RouterView v-slot="{ Component }">
            <Transition name="fade" mode="out-in">
              <component :is="Component" v-if="Component" />
              <div v-else class="demo-overview">
                <h1>Vue Amazing UI 组件演示</h1>
                <p class="u-intro">
                  左侧菜单选择组件，进入对应演示页核验功能、样式、联动与布局；全部演示页均通过 unplugin-vue-components +
                  VueAmazingUIResolver 自动按需引入组件。
                </p>
                <Row :gutter="[16, 16]">
                  <Col v-for="group in demoGroups" :key="group.title" :xs="24" :sm="12" :lg="8">
                    <Card :title="group.title" size="small">
                      <Space wrap>
                        <RouterLink
                          v-for="component in group.components"
                          :key="component.key"
                          :to="`${basePath}/${component.key}`"
                        >
                          <Tag>{{ component.name }}</Tag>
                        </RouterLink>
                      </Space>
                    </Card>
                  </Col>
                </Row>
              </div>
            </Transition>
          </RouterView>
          <BackTop v-if="!hideBackTop" :listen-to="getContentScrollTarget" />
        </div>
      </Scrollbar>
    </Col>
  </Row>
</template>

<style lang="scss" scoped>
// 整行撑满视口高度，作为两列高度的唯一声明源（Row 为 wrap 容器，交叉轴 stretch 无法压低列高，故列高以 100% 派生）
.demo-row {
  height: 100vh;
}

// 左侧菜单列：纵向弹性布局，头部固定 + 菜单区占满剩余高度
.demo-menu-col {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-right: 1px solid rgba(0, 0, 0, 0.06);
}

.demo-menu-header {
  flex: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 16px 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

// 标题行：组件库名（渐变）+ 版本标签；flex-start 顶对齐，标签不做垂直居中
.demo-menu-title-row {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 6px;
}

// 版本标签上移，落在标题右上角形成角标观感（小尺寸标签行盒与标题行盒高度接近，仅顶对齐几乎看不出差异）
.demo-menu-version {
  margin-top: -4px;
}

.demo-menu-title {
  font-size: 18px;
  font-weight: 600;
  // 渐变文字：与演示页 h1 共用 demo.global.scss 中的 --demo-title-gradient
  background-image: var(--demo-title-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.demo-menu-count {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}

// 主题色行：标签 + 预览色块 + 颜色编辑器，修改后全局组件配色实时联动
.demo-menu-theme {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.demo-menu-theme-label {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}

// 主题色预览色块：圆形与 ColorPicker 的矩形触发器形成形状对比，避免两个色块视觉重复
.demo-theme-swatch {
  flex: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

// 菜单滚动区：占满剩余高度，交由 Scrollbar 组件接管滚动
.demo-menu-scroll {
  flex: 1;
  min-height: 0;
}

.demo-menu {
  width: 100%;
  border-inline-end: none;
}

// 右侧内容列：高度由 .demo-row 派生；min-width: 0 防止长内容撑破 flex 布局
.demo-content-col {
  height: 100%;
  min-width: 0;
}

// 内容区滚动：撑满列高，交由 Scrollbar 组件接管滚动
.demo-content-scroll {
  height: 100%;
}

// 内容区内边距（对齐官方演示工程 .router-view 约定）
.router-view {
  padding: 36px;
}

// 路由切换淡入淡出（对齐官方演示工程）
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.demo-overview {
  max-width: 1200px;
}
</style>
