import pluginVue from 'eslint-plugin-vue' // 专为 Vue 设计的代码质量检查工具
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript' // 为 Vue + TypeScript 项目提供开箱即用的 ESLint 规则
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting' // 解决 ESLint 和 Prettier 的规则冲突

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}']
  },

  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**']
  },

  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended, // 包含 Vue 官方推荐的 TypeScript 编码规则
  skipFormatting, // 关闭所有与 Prettier 冲突的 ESLint 规则 (必须放在后面，确保正确覆盖冲突规则，否则无效)

  // 添加自定义规则
  {
    name: 'custom-eslint-rules',
    rules: {
      // '@typescript-eslint/no-explicit-any': 'off',
      // '@typescript-eslint/no-unused-vars': 'off',
      // '@typescript-eslint/no-unused-expressions': 'off',
      // '@typescript-eslint/no-duplicate-enum-values': 'off',
      // '@typescript-eslint/no-unsafe-function-type': 'off',
      // 'vue/multi-word-component-names': 'off',
      // 'vue/no-unused-vars': 'off',
      // 'vue/return-in-computed-property': 'off'
    }
  }
)
