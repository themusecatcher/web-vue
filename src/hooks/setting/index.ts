import type { GlobConfig } from '#/config'

import { getAppEnvConfig } from 'utils/env'

export const useGlobSetting = (): Readonly<GlobConfig> => {
  // VITE_GLOB_APP_SHORT_NAME 的合法性校验统一由 getAppEnvConfig 负责（src/utils/env.ts），此处不再重复校验：
  // 同一变量、同一正则，重复只会把同一次配置错误告警成两条
  const {
    VITE_GLOB_APP_TITLE,
    VITE_GLOB_API_URL,
    VITE_GLOB_APP_SHORT_NAME,
    VITE_GLOB_API_URL_PREFIX,
    VITE_GLOB_UPLOAD_URL,
    VITE_GLOB_IMG_URL
  } = getAppEnvConfig()

  // Take global configuration
  const glob: Readonly<GlobConfig> = {
    title: VITE_GLOB_APP_TITLE,
    apiUrl: VITE_GLOB_API_URL,
    shortName: VITE_GLOB_APP_SHORT_NAME,
    urlPrefix: VITE_GLOB_API_URL_PREFIX,
    uploadUrl: VITE_GLOB_UPLOAD_URL,
    imgUrl: VITE_GLOB_IMG_URL
  }
  return glob as Readonly<GlobConfig>
}
