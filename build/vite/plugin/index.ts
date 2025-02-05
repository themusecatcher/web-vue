import type { Plugin, PluginOption } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
// import { VueAmazingUIResolver } from 'vue-amazing-ui'

import { configCompressPlugin } from './compress'
import { configCDNImportPlugin } from './cdn'
import { configStyleImportPlugin } from './style'
import { configHtmlPlugin } from './html'
import { configVisualizerPlugin } from './visualizer'

// 组件库中的所有组件路径映射
const componentsMap = {
  Alert: 'alert',
  Avatar: 'avatar',
  BackTop: 'backtop',
  Badge: 'badge',
  Breadcrumb: 'breadcrumb',
  Button: 'button',
  Card: 'card',
  Carousel: 'carousel',
  Cascader: 'cascader',
  Checkbox: 'checkbox',
  Collapse: 'collapse',
  Countdown: 'countdown',
  DatePicker: 'datepicker',
  Descriptions: 'descriptions/descriptions',
  DescriptionsItem: 'descriptions/descriptionsitem',
  Dialog: 'dialog',
  Divider: 'divider',
  Drawer: 'drawer',
  Ellipsis: 'ellipsis',
  Empty: 'empty',
  Flex: 'flex',
  FloatButton: 'floatbutton',
  GradientText: 'gradienttext',
  Row: 'grid/row',
  Col: 'grid/col',
  Image: 'image',
  Input: 'input',
  InputNumber: 'inputnumber',
  InputSearch: 'inputsearch',
  Layout: 'layout',
  LayoutHeader: 'layout/layoutheader',
  LayoutSider: 'layout/layoutsider',
  LayoutContent: 'layout/layoutcontent',
  LayoutFooter: 'layout/layoutfooter',
  List: 'list/list',
  ListItem: 'list/listitem',
  LoadingBar: 'loadingbar',
  Message: 'message',
  Modal: 'modal',
  Notification: 'notification',
  NumberAnimation: 'numberanimation',
  Pagination: 'pagination',
  Popconfirm: 'popconfirm',
  Popover: 'popover',
  Progress: 'progress',
  QRCode: 'qrcode',
  Radio: 'radio',
  Rate: 'rate',
  Result: 'result',
  Scrollbar: 'scrollbar',
  Segmented: 'segmented',
  Select: 'select',
  Skeleton: 'skeleton',
  Slider: 'slider',
  Space: 'space',
  Spin: 'spin',
  Statistic: 'statistic',
  Steps: 'steps',
  Swiper: 'swiper',
  Switch: 'switch',
  Table: 'table',
  Tabs: 'tabs',
  Tag: 'tag',
  Textarea: 'textarea',
  TextScroll: 'textscroll',
  Timeline: 'timeline',
  TimePicker: 'timepicker',
  Tooltip: 'tooltip',
  Upload: 'upload',
  Video: 'video',
  Waterfall: 'waterfall',
  Watermark: 'watermark'
}
function getSideEffects(componentName: string, options?: VueAmazingUIResolverOptions) {
  const type = options?.cjs ? 'lib' : 'es'
  const sideEffects = [`vue-amazing-ui/${type}/${componentsMap[componentName as keyof typeof componentsMap]}/${componentName}.css`]
  // 依赖子组件的样式
  const AvatarStyle = ['ListItem']
  if (AvatarStyle.includes(componentName)) {
    sideEffects.push(`vue-amazing-ui/${type}/avatar/Avatar.css`)
  }
  const BadgeStyle = ['FloatButton']
  if (BadgeStyle.includes(componentName)) {
    sideEffects.push(`vue-amazing-ui/${type}/badge/Badge.css`)
  }
  const ButtonStyle = ['Collapse', 'ColorPicker', 'Dialog', 'InputSearch', 'Modal', 'Popconfirm']
  if (ButtonStyle.includes(componentName)) {
    sideEffects.push(`vue-amazing-ui/${type}/button/Button.css`)
  }
  const CheckboxStyle = ['Table']
  if (CheckboxStyle.includes(componentName)) {
    sideEffects.push(`vue-amazing-ui/${type}/checkbox/Checkbox.css`)
  }
  const EllipsisStyle = ['Table']
  if (EllipsisStyle.includes(componentName)) {
    sideEffects.push(`vue-amazing-ui/${type}/ellipsis/Ellipsis.css`)
  }
  const EmptyStyle = ['List', 'Select', 'Table']
  if (EmptyStyle.includes(componentName)) {
    sideEffects.push(`vue-amazing-ui/${type}/empty/Empty.css`)
  }
  const ImageStyle = ['Upload']
  if (ImageStyle.includes(componentName)) {
    sideEffects.push(`vue-amazing-ui/${type}/image/Image.css`)
  }
  const InputStyle = ['ColorPicker', 'Pagination']
  if (InputStyle.includes(componentName)) {
    sideEffects.push(`vue-amazing-ui/${type}/input/Input.css`)
  }
  const MessageStyle = ['Upload']
  if (MessageStyle.includes(componentName)) {
    sideEffects.push(`vue-amazing-ui/${type}/message/Message.css`)
  }
  const PaginationStyle = ['List', 'Table']
  if (PaginationStyle.includes(componentName)) {
    sideEffects.push(`vue-amazing-ui/${type}/pagination/Pagination.css`)
  }
  const RadioStyle = ['Table']
  if (RadioStyle.includes(componentName)) {
    sideEffects.push(`vue-amazing-ui/${type}/radio/Radio.css`)
  }
  const ScrollbarStyle = ['Dialog', 'Drawer', 'Select', 'Table']
  if (ScrollbarStyle.includes(componentName)) {
    sideEffects.push(`vue-amazing-ui/${type}/scrollbar/Scrollbar.css`)
  }
  const SelectStyle = ['Cascader', 'Pagination']
  if (SelectStyle.includes(componentName)) {
    sideEffects.push(`vue-amazing-ui/${type}/select/Select.css`)
  }
  const SkeletonStyle = ['Card']
  if (SkeletonStyle.includes(componentName)) {
    sideEffects.push(`vue-amazing-ui/${type}/skeleton/Skeleton.css`)
  }
  const SpaceStyle = ['Image', 'Tag', 'Upload']
  if (SpaceStyle.includes(componentName)) {
    sideEffects.push(`vue-amazing-ui/${type}/space/Space.css`)
  }
  const SpinStyle = ['Carousel', 'Image', 'List', 'Table', 'Upload', 'Waterfall']
  if (SpinStyle.includes(componentName)) {
    sideEffects.push(`vue-amazing-ui/${type}/spin/Spin.css`)
  }
  const TooltipStyle = ['BackTop', 'ColorPicker', 'Ellipsis', 'FloatButton', 'Popconfirm', 'Popover', 'Rate', 'Table']
  if (TooltipStyle.includes(componentName)) {
    sideEffects.push(`vue-amazing-ui/${type}/tooltip/Tooltip.css`)
  }
  return sideEffects
}
export interface VueAmazingUIResolverOptions {
  cjs?: boolean // use commonjs build, default false
}
export function VueAmazingUIResolver(options?: VueAmazingUIResolverOptions) {
  return {
    type: 'component' as const,
    resolve: (componentName: string) => {
      // where `componentName` is always CapitalCase
      if (componentName in componentsMap) {
        return {
          name: componentName, // 组件名
          from: 'vue-amazing-ui', // 组件库名称
          sideEffects: getSideEffects(componentName, options) // 组件样式文件
        }
      }
    }
  }
}
export function createVitePlugins(viteEnv: ViteEnv, isBuild: boolean) {
  const { VITE_BUILD_COMPRESS, VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE, VITE_IMPORT_STYLE, VITE_USE_CDN, VITE_ENABLE_ANALYZE } = viteEnv

  const vitePlugins: (Plugin | Plugin[] | PluginOption | PluginOption[])[] = [
    vue(),
    AutoImport({
      // dts: 'src/auto-imports.d.ts', // 自动引入生成的配置文件
      imports: ['vue', 'vue-router', 'pinia'],

      eslintrc: {
        enabled: true, // 默认false, true 启用。生成一次就可以，为避免每次工程启动都生成，一旦生成配置文件之后，可以把 enable 关掉
        filepath: './.eslintrc-auto-import.json', // 生成json文件,可以不配置该项，默认就是将生成在根目录
        globalsPropValue: true
      }
    }),
    Components({
      // 自动引入项目自定义组件和组件库的组件
      // dts: 'src/components.d.ts', // 自动引入生成的配置文件
      // dirs: ['src/components'], // 配置需要默认导入的自定义组件文件夹，该文件夹下的所有组件都会自动 import
      // deep: true, // 深度扫描，默认 false
      resolvers: [
        AntDesignVueResolver({
          importStyle: false // css in js
        }),
        // auto import components from VueAmazingUI
        VueAmazingUIResolver()
      ]
    })
  ]

  if (isBuild) {
    // rollup-plugin-gzip
    vitePlugins.push(configCompressPlugin(VITE_BUILD_COMPRESS, VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE))
  }

  // vite-plugin-style-import
  if (VITE_IMPORT_STYLE) {
    vitePlugins.push(configStyleImportPlugin())
  }


  // vite-plugin-cdn-import
  if (VITE_USE_CDN) {
    vitePlugins.push(configCDNImportPlugin())
  }

  // vite-plugin-html
  vitePlugins.push(configHtmlPlugin(viteEnv, isBuild))

  // rollup-plugin-visualizer
  if (VITE_ENABLE_ANALYZE) {
    vitePlugins.push(configVisualizerPlugin())
  }

  return vitePlugins
}
