/**
 * 浏览器端本地存储工具：带 TTL 的 KV 缓存 + cookie 读写
 *
 * 定位：**浏览器端**、长期有效的偏好或带存活时长的缓存，不做加密（localStorage 不是安全存储，
 * 敏感凭证请走 httpOnly cookie）。
 *
 * 设计约束（均来自实测缺陷，勿随意回退）：
 * 1. 不在模块加载期触碰 `localStorage`：Node / SSR 下该全局不存在，模块顶层取默认值会直接
 *    抛 `ReferenceError`，故底层存储在首次读写时惰性解析；
 * 2. 键名不做大小写归一：`.toUpperCase()` 会让 `userToken` 与 `usertoken` 撞成同一个键，
 *    且与其它模块/其它项目的键名口径不一致；
 * 3. 所有底层调用都包 try/catch：隐私模式会抛 `SecurityError`、配额满会抛
 *    `QuotaExceededError`，缓存失败不应中断业务；
 * 4. `get` 遇到「结构不符的数据」只返回默认值、**绝不删除**（他人数据不能被我们误清）；
 *    结构相符但 `expire` 非法的记录视为本地数据损坏，会被清理；
 * 5. `clear()` / `clearCookie()` 按实例前缀清理：带前缀的实例不会波及其它模块的数据；
 *    无前缀实例（含本文件的默认导出 `storage`）没有归属标识，等价于清空整个 localStorage /
 *    当前页面可见的全部 cookie —— 业务代码应 `new Storage('app:')` 自建带命名空间的实例。
 */

/** 默认缓存时长（秒）：7 天 */
const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 7

/** Web Storage 最小接口：便于注入 sessionStorage 与测试替身 */
export interface StorageLike {
  readonly length: number
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
  key(index: number): string | null
}

/** cookie 写入选项 */
export interface CookieOptions {
  /** 存活时长（秒），`null` 表示会话级（关闭浏览器失效）；默认 7 天 */
  ttlSeconds?: number | null
  /** 作用路径，默认 `/`：不设会退化成当前目录，导致其它路由读不到、也删不掉 */
  path?: string
  /** 默认 `Lax`：跨站请求不携带，避免 CSRF 风险 */
  sameSite?: 'Lax' | 'Strict' | 'None'
  /** 仅 HTTPS 下发送 */
  secure?: boolean
  /** cookie 域，默认当前域 */
  domain?: string
}

/** 本工具写入的存储记录 */
interface CacheRecord {
  value: unknown
  expire: number | null
}

function warn(message: string, error?: unknown): void {
  if (error === undefined) {
    console.warn(`[storage] ${message}`)
    return
  }
  console.warn(`[storage] ${message}`, error)
}

/**
 * 校验 TTL（单位：秒）
 *
 * 只接受有限数字，负数按「已过期」处理（测试与主动失效都依赖该语义）；
 * `NaN` / `Infinity` 等非法值回落默认时长并告警，避免把过期时间算成 NaN 后条目永不失效。
 */
function normalizeTtl(ttlSeconds: number): number {
  if (!Number.isFinite(ttlSeconds)) {
    warn(`TTL 非法（${String(ttlSeconds)}），已回落默认值 ${DEFAULT_TTL_SECONDS} 秒`)
    return DEFAULT_TTL_SECONDS
  }
  return ttlSeconds
}

/** 是否为本工具写入的记录：结构不符的数据属于他人，不能当成自己的缓存去删 */
function isCacheRecord(data: unknown): data is CacheRecord {
  return typeof data === 'object' && data !== null && 'value' in data && 'expire' in data
}

/**
 * 创建本地缓存对象
 * @param {string=} prefixKey - 键名前缀（命名空间），建议自带分隔符，如 `'app:'`
 * @param {StorageLike} [storage=localStorage] - sessionStorage | localStorage | 测试替身
 */
export class Storage {
  private storage?: StorageLike
  private prefixKey: string
  /** 底层存储不可用的告警只打一次，避免每次读写都刷屏 */
  private unavailableWarned = false

  constructor(prefixKey = '', storage?: StorageLike) {
    this.prefixKey = prefixKey
    this.storage = storage
  }

  /** 惰性解析底层存储：模块加载期与 Node / SSR 环境下不访问 localStorage */
  private getStore(): StorageLike | null {
    if (this.storage) return this.storage
    try {
      // 浏览器禁用 cookie / 隐私模式下，读取 localStorage 属性本身就会抛 SecurityError，
      // 故「探测 + 取值」必须整体放进 try，失败时按「存储不可用」降级
      if (typeof localStorage === 'undefined') {
        if (!this.unavailableWarned) {
          this.unavailableWarned = true
          warn('当前环境无 localStorage，缓存读写已降级为无操作')
        }
        return null
      }
      this.storage = localStorage
    } catch (error) {
      if (!this.unavailableWarned) {
        this.unavailableWarned = true
        warn('localStorage 不可用，缓存读写已降级为无操作', error)
      }
      return null
    }
    return this.storage
  }

  /** 键名 = 前缀 + 原样键名（不做大小写归一，见文件头约束 2） */
  private getKey(key: string): string {
    return `${this.prefixKey}${key}`
  }

  /**
   * 设置缓存
   * @param {string} key 缓存键
   * @param {unknown} value 缓存值；传 `undefined` 等价于删除该键（原生 `setItem` 会把它存成字符串
   *                      `"undefined"`，故在此显式转为删除，避免读出脏值）
   * @param {number | null} [ttlSeconds=DEFAULT_TTL_SECONDS] 存活时长（秒），`null` 表示永不过期
   */
  set(key: string, value: unknown, ttlSeconds: number | null = DEFAULT_TTL_SECONDS): void {
    const store = this.getStore()
    if (!store) return
    if (value === undefined) {
      this.remove(key)
      return
    }
    const ttl = ttlSeconds === null ? null : normalizeTtl(ttlSeconds)
    let payload: string
    try {
      payload = JSON.stringify({ value, expire: ttl === null ? null : Date.now() + ttl * 1000 })
    } catch (error) {
      // 循环引用等无法序列化的值：告警并放弃写入，避免异常冒泡到业务
      warn(`写入 ${this.getKey(key)} 失败：值无法序列化`, error)
      return
    }
    try {
      store.setItem(this.getKey(key), payload)
    } catch (error) {
      warn(`写入 ${this.getKey(key)} 失败`, error)
    }
  }

  /**
   * 读取缓存
   * @param {string} key 缓存键
   * @param {T | null} [def=null] 未命中 / 已过期 / 数据损坏时的默认值
   */
  get<T>(key: string, def: T | null = null): T | null {
    const store = this.getStore()
    if (!store) return def
    let item: string | null
    try {
      item = store.getItem(this.getKey(key))
    } catch (error) {
      warn(`读取 ${this.getKey(key)} 失败`, error)
      return def
    }
    if (item === null) return def
    let data: unknown
    try {
      data = JSON.parse(item)
    } catch {
      // 损坏的 JSON 也可能来自其它模块，保持原样不删
      return def
    }
    // 非本工具写入的裸值：只返回默认值，绝不删除（曾因缺少该校验而误删同名大写键）
    if (!isCacheRecord(data)) return def
    const { value, expire } = data
    if (expire === null || (typeof expire === 'number' && expire >= Date.now())) {
      return value as T
    }
    this.remove(key)
    return def
  }

  /**
   * 删除某一项
   * @param {string} key
   */
  remove(key: string): void {
    const store = this.getStore()
    if (!store) return
    try {
      store.removeItem(this.getKey(key))
    } catch (error) {
      warn(`删除 ${this.getKey(key)} 失败`, error)
    }
  }

  /**
   * 清空本实例命名空间下的缓存
   *
   * 带前缀的实例只删除前缀匹配的键；无前缀实例没有归属标识，语义上等价于清空整个存储。
   */
  clear(): void {
    const store = this.getStore()
    if (!store) return
    const matched: string[] = []
    try {
      // 先收集再删除：边遍历边删会打乱索引，导致漏删
      for (let i = 0; i < store.length; i++) {
        const name = store.key(i)
        if (name !== null && name.startsWith(this.prefixKey)) matched.push(name)
      }
      matched.forEach((name) => store.removeItem(name))
    } catch (error) {
      warn('清空缓存失败', error)
    }
  }

  /**
   * 设置 cookie
   * @param {string} name cookie 名称
   * @param {string | number} value cookie 值（内部 `encodeURIComponent`，中文与 `;` `=` 可安全往返）
   * @param {CookieOptions} [options] 见 CookieOptions
   */
  setCookie(name: string, value: string | number, options: CookieOptions = {}): void {
    if (typeof document === 'undefined') return
    const { ttlSeconds = DEFAULT_TTL_SECONDS, path = '/', sameSite = 'Lax', secure = false, domain } = options
    const ttl = ttlSeconds === null ? null : normalizeTtl(ttlSeconds)
    // SameSite=None 必须搭配 Secure，否则浏览器直接丢弃该 cookie（表现为「写了但读不到」）
    let finalSecure = secure
    if (sameSite === 'None' && !secure) {
      warn(`cookie ${this.getKey(name)} 使用 SameSite=None 但未开启 secure，已自动补 Secure`)
      finalSecure = true
    }
    const attributes = [`Path=${path}`, `SameSite=${sameSite}`]
    if (ttl !== null) attributes.push(`Max-Age=${Math.floor(ttl)}`)
    if (finalSecure) attributes.push('Secure')
    if (domain) attributes.push(`Domain=${domain}`)
    try {
      document.cookie = `${this.getKey(name)}=${encodeURIComponent(String(value))}; ${attributes.join('; ')}`
    } catch (error) {
      warn(`写入 cookie ${this.getKey(name)} 失败`, error)
    }
  }

  /**
   * 读取 cookie
   * @param {string} name cookie 名称
   * @returns 解码后的值；不存在时返回空串
   */
  getCookie(name: string): string {
    if (typeof document === 'undefined') return ''
    const target = this.getKey(name)
    const cookies = document.cookie ? document.cookie.split('; ') : []
    for (const cookie of cookies) {
      // 用首个 `=` 定位分隔符：值本身可能含 `=`（如 base64），`split('=')` 会把值截断
      const separator = cookie.indexOf('=')
      if (separator === -1) continue
      if (cookie.slice(0, separator) !== target) continue
      const raw = cookie.slice(separator + 1)
      try {
        return decodeURIComponent(raw)
      } catch {
        return raw
      }
    }
    return ''
  }

  /**
   * 删除指定 cookie
   * @param {string} name cookie 名称
   * @param {string} [path='/'] 必须与写入时的 path 一致，否则浏览器不会删除
   * @param {string} [domain] 必须与写入时的 domain 一致，否则浏览器不会删除
   */
  removeCookie(name: string, path = '/', domain?: string): void {
    this.expireCookie(this.getKey(name), path, domain)
  }

  /**
   * 清空本实例命名空间下的 cookie
   *
   * 带前缀的实例只让前缀匹配的 cookie 失效；无前缀实例等价于清理当前页面可见的全部 cookie。
   * @param {string} [path='/'] 必须与写入时的 path 一致，否则删不掉（会静默失效）
   * @param {string} [domain] 必须与写入时的 domain 一致，否则删不掉
   */
  clearCookie(path = '/', domain?: string): void {
    this.readCookieNames()
      .filter((name) => name.startsWith(this.prefixKey))
      .forEach((name) => this.expireCookie(name, path, domain))
  }

  /**
   * 解析 `document.cookie` 中的 cookie 名
   *
   * 按 `; ` 切分后取首个 `=` 之前的部分：用正则匹配 `xxx=` 会把「值里含 `=` 的 cookie」
   * 误拆出一个并不存在的名字（如 `raw=ab=y` 会额外得到 `ab`），从而误删同名的其它 cookie。
   */
  private readCookieNames(): string[] {
    if (typeof document === 'undefined' || !document.cookie) return []
    return document.cookie
      .split('; ')
      .map((cookie) => {
        const separator = cookie.indexOf('=')
        return separator === -1 ? '' : cookie.slice(0, separator)
      })
      .filter((name) => name !== '')
  }

  /**
   * 让指定完整 cookie 名立即过期（`fullName` 已含前缀，内部不再拼接）
   *
   * 只写 name + path + domain：这三个属性参与匹配，其余属性写不写都不影响删除。
   */
  private expireCookie(fullName: string, path: string, domain?: string): void {
    if (typeof document === 'undefined') return
    const parts = [`${fullName}=`, 'Max-Age=0', `Path=${path}`]
    if (domain) parts.push(`Domain=${domain}`)
    try {
      document.cookie = parts.join('; ')
    } catch (error) {
      warn(`删除 cookie ${fullName} 失败`, error)
    }
  }
}

// 默认导出为无前缀实例：它的 clear() / clearCookie() 等价于清空整个 localStorage / 当前页面可见的
// 全部 cookie（没有归属标识可供过滤）。业务代码请优先 `new Storage('app:')` 自建带命名空间的实例。
const storage = new Storage('')

export default storage
