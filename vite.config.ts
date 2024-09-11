import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Components({ // 自动引入项目自定义组件和组件库的组件
      dirs: ['src/components'], // 配置需要默认导入的自定义组件文件夹，该文件夹下的所有组件都会自动 import
      resolvers: [
        AntDesignVueResolver({
          importStyle: false // css in js
        })
      ]
    }),
    AutoImport({
      dts: 'src/auto-imports.d.ts', // 自动引入生成的配置文件
      imports: ['vue', 'vue-router', 'pinia'],

      eslintrc: {
        enabled: true, // 默认false, true 启用。生成一次就可以，为避免每次工程启动都生成，一旦生成配置文件之后，可以把 enable 关掉
        filepath: './.eslintrc-auto-import.json', // 生成json文件,可以不配置该项，默认就是将生成在根目录
        globalsPropValue: true
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'images': fileURLToPath(new URL('./src/assets/images', import.meta.url)),
      'less': fileURLToPath(new URL('./src/assets/less', import.meta.url)),
      'components': fileURLToPath(new URL('./src/components', import.meta.url)),
    }
  },
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: { // 或者globalVars
          // `themeColor` is global variables fields name
          themeColor: '#1677FF' // #1890FF
        },
        javascriptEnabled: true
      }
    }
  },
  server: {
    host: true, // 指定服务器应该监听哪个 IP 地址。 如果将此设置为 0.0.0.0 或者 true 将监听所有地址，包括局域网和公网地址。
    port: 8080, // 指定开发服务器端口
    open: true // 开发服务器启动时，自动在浏览器中打开应用程序。当该值为字符串时，它将被用作 URL 的路径名。
  }
})
