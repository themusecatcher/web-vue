/**
 * 【构建配置统一出口】通过参数在 old / new 两套构建配置间切换（可立即使用）
 *
 * 环境依赖要求：
 * - 新版本（config-new.ts）：Vite ≥ 8.x，底层打包器 Rolldown，压缩器默认 OXC
 * - 旧版本（config-old.ts）：Vite ≤ 7.x，底层打包器 Rollup，压缩器默认 esbuild
 * - Terser：两套配置中使用 'terser' 压缩时均需安装 `pnpm i terser -D`
 * - Node ≥ 20.19.0（见 package.json engines）
 *
 * 使用示例（vite.config.ts）：
 *   import { createBuildConfig } from './build/vite/build-config/index.ts'
 *   build: createBuildConfig(isBuild, 'new') // 切换旧版：createBuildConfig(isBuild, 'old')
 */
import type { BuildOptions } from 'vite'
import { createNewBuildConfig } from './config-new.ts'
import { createOldBuildConfig } from './config-old.ts'

/** 构建引擎：'new'（Vite ≥ 8.x，默认）| 'old'（Vite ≤ 7.x） */
export type BuildEngine = 'new' | 'old'

/**
 * 创建构建配置（按引擎参数返回对应版本的配置）
 * @param isBuild 是否生产构建（command === 'build'）
 * @param engine 构建引擎，默认 'new'
 */
export function createBuildConfig(isBuild: boolean, engine: BuildEngine = 'new'): BuildOptions {
  return engine === 'old' ? createOldBuildConfig(isBuild) : createNewBuildConfig(isBuild)
}
