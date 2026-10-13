/**
 * vue-amazing-ui 组件演示目录清单
 *
 * 导航菜单（Index.vue）以此文件为数据源；
 * 路由（src/router/index.ts）通过 import.meta.glob 编译时收集 amazing-ui/<kebab-case>/ 下的演示页。
 * 新增演示页只需补充 Index.vue + index.ts 两个文件，并在本清单登记。
 */

export interface DemoComponent {
  /** 目录名（kebab-case），同时决定路由 path：/amazing-ui/<key> */
  key: string
  /** 组件名（PascalCase） */
  name: string
  /** 中文标题 */
  title: string
}

export interface DemoGroup {
  title: string
  components: DemoComponent[]
}

export const demoGroups: DemoGroup[] = [
  {
    title: '通用',
    components: [
      { key: 'button', name: 'Button', title: '按钮' },
      { key: 'space', name: 'Space', title: '间距' },
      { key: 'flex', name: 'Flex', title: '弹性布局' },
      { key: 'divider', name: 'Divider', title: '分割线' },
      { key: 'config-provider', name: 'ConfigProvider', title: '全局配置' },
      { key: 'watermark', name: 'Watermark', title: '水印' }
    ]
  },
  {
    title: '布局',
    components: [
      { key: 'layout', name: 'Layout', title: '布局' },
      { key: 'grid', name: 'Grid', title: '栅格' }
    ]
  },
  {
    title: '导航',
    components: [
      { key: 'menu', name: 'Menu', title: '导航菜单' },
      { key: 'breadcrumb', name: 'Breadcrumb', title: '面包屑' },
      { key: 'steps', name: 'Steps', title: '步骤条' },
      { key: 'pagination', name: 'Pagination', title: '分页' },
      { key: 'back-top', name: 'BackTop', title: '回到顶部' },
      { key: 'float-button', name: 'FloatButton', title: '悬浮按钮' },
      { key: 'dropdown', name: 'Dropdown', title: '下拉菜单' },
      { key: 'segmented', name: 'Segmented', title: '分段控制器' }
    ]
  },
  {
    title: '数据录入',
    components: [
      { key: 'input', name: 'Input', title: '输入框' },
      { key: 'input-number', name: 'InputNumber', title: '数字输入框' },
      { key: 'input-search', name: 'InputSearch', title: '搜索输入框' },
      { key: 'textarea', name: 'Textarea', title: '文本域' },
      { key: 'auto-complete', name: 'AutoComplete', title: '自动完成' },
      { key: 'select', name: 'Select', title: '选择器' },
      { key: 'cascader', name: 'Cascader', title: '级联选择' },
      { key: 'checkbox', name: 'Checkbox', title: '复选框' },
      { key: 'radio', name: 'Radio', title: '单选框' },
      { key: 'switch', name: 'Switch', title: '开关' },
      { key: 'slider', name: 'Slider', title: '滑动输入' },
      { key: 'rate', name: 'Rate', title: '评分' },
      { key: 'color-picker', name: 'ColorPicker', title: '颜色选择器' },
      { key: 'date-picker', name: 'DatePicker', title: '日期选择器' },
      { key: 'calendar', name: 'Calendar', title: '日历' },
      { key: 'upload', name: 'Upload', title: '上传' }
    ]
  },
  {
    title: '数据展示',
    components: [
      { key: 'avatar', name: 'Avatar', title: '头像' },
      { key: 'badge', name: 'Badge', title: '徽标数' },
      { key: 'card', name: 'Card', title: '卡片' },
      { key: 'carousel', name: 'Carousel', title: '轮播图' },
      { key: 'collapse', name: 'Collapse', title: '折叠面板' },
      { key: 'comment', name: 'Comment', title: '评论' },
      { key: 'descriptions', name: 'Descriptions', title: '描述列表' },
      { key: 'ellipsis', name: 'Ellipsis', title: '文本省略' },
      { key: 'empty', name: 'Empty', title: '空状态' },
      { key: 'gradient-text', name: 'GradientText', title: '渐变文字' },
      { key: 'highlight', name: 'Highlight', title: '高亮文本' },
      { key: 'image', name: 'Image', title: '图片' },
      { key: 'list', name: 'List', title: '列表' },
      { key: 'number-animation', name: 'NumberAnimation', title: '数字动画' },
      { key: 'popover', name: 'Popover', title: '气泡卡片' },
      { key: 'popconfirm', name: 'Popconfirm', title: '气泡确认' },
      { key: 'qr-code', name: 'QRCode', title: '二维码' },
      { key: 'result', name: 'Result', title: '结果' },
      { key: 'skeleton', name: 'Skeleton', title: '骨架屏' },
      { key: 'statistic', name: 'Statistic', title: '统计数值' },
      { key: 'table', name: 'Table', title: '表格' },
      { key: 'tabs', name: 'Tabs', title: '标签页' },
      { key: 'tag', name: 'Tag', title: '标签' },
      { key: 'text-scroll', name: 'TextScroll', title: '文字滚动' },
      { key: 'timeline', name: 'Timeline', title: '时间线' },
      { key: 'tooltip', name: 'Tooltip', title: '文字提示' },
      { key: 'video', name: 'Video', title: '视频' },
      { key: 'waterfall', name: 'Waterfall', title: '瀑布流' }
    ]
  },
  {
    title: '反馈',
    components: [
      { key: 'alert', name: 'Alert', title: '警告提示' },
      { key: 'dialog', name: 'Dialog', title: '对话框' },
      { key: 'drawer', name: 'Drawer', title: '抽屉' },
      { key: 'loading-bar', name: 'LoadingBar', title: '加载进度条' },
      { key: 'message', name: 'Message', title: '全局提示' },
      { key: 'modal', name: 'Modal', title: '模态框' },
      { key: 'notification', name: 'Notification', title: '通知提醒' },
      { key: 'progress', name: 'Progress', title: '进度条' },
      { key: 'spin', name: 'Spin', title: '加载中' }
    ]
  },
  {
    title: '其他',
    components: [
      { key: 'countdown', name: 'Countdown', title: '倒计时' },
      { key: 'scrollbar', name: 'Scrollbar', title: '滚动条' },
      { key: 'swiper', name: 'Swiper', title: '幻灯片' }
    ]
  }
]

/** 全部组件（扁平化，按分类顺序） */
export const demoComponents: DemoComponent[] = demoGroups.flatMap((group) => group.components)

/** 组件总数 */
export const demoComponentCount = demoComponents.length
