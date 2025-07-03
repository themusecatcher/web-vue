import { isObject } from './is/index'

/**
 * 根据文件名和类型获取静态资源地址
 *
 * @param {string | number} name 图片文件的名称，可以是字符串或数字类型
 * @param {string} [type = 'png'] 图片文件的类型，默认为 'png'
 * @returns {string} 返回图片的完整 URL 地址
 */
export function getImageUrl(name: string | number, type: string = 'png'): string {
  return new URL(`../assets/images/${name}.${type}`, import.meta.url).href
}

/**
 * 深度合并两个对象
 *
 * 该函数的目的是将两个对象进行深度合并，意味着如果对象的属性值是另一个对象，
 * 则会递归地合并这些内部对象，而不是简单地覆盖它们
 *
 * @param {any} [src = {}] 源对象，将被合并的对象
 * @param {any} [target = {}] 目标对象，其属性将被合并到源对象中
 * @returns 返回合并后的对象，具有源对象和目标对象的所有属性
 */
export function deepMerge<T = any>(src: any = {}, target: any = {}): T {
  let key: string
  for (key in target) {
    src[key] = isObject(src[key]) ? deepMerge(src[key], target[key]) : (src[key] = target[key])
  }
  return src
}

/**
 * 检查给定的字符串是否是有效的 URL
 *
 * 该函数使用正则表达式来验证字符串是否以 http 或 https 协议开头，从而判断其是否可能是一个 URL
 * 这是一个简单的验证，仅检查 URL 的开头部分，并不检查域名的有效性或路径的正确性
 *
 * @param {string} url 待验证的字符串
 * @returns {boolean} 如果字符串可能是有效的 URL，则返回 true；否则返回 false
 */
export function isUrl(url: string): boolean {
  return /^(http|https):\/\//g.test(url)
}

/**
 * 将对象的属性转换为 URL 的查询参数并附加到 URL 上
 *
 * @param {string} baseUrl 待拼接查询参数的 url
 * @param {object} obj 查询参数对象
 * @returns {string} 返回包含查询参数的完整 URL
 *
 * 例子:
 *  let obj = {a: '3', b: '4'}
 *  setObjToUrlParams('www.baidu.com', obj)
 *  ==>www.baidu.com?a=3&b=4
 */
export function setObjToUrlParams(baseUrl: string, obj: object): string {
  let parameters = ''
  let url = ''
  for (const key in obj) {
    parameters += key + '=' + encodeURIComponent(obj[key as keyof typeof obj]) + '&'
  }
  parameters = parameters.replace(/&$/, '')
  if (/\?$/.test(baseUrl)) {
    url = baseUrl + parameters
  } else {
    url = baseUrl.replace(/\/?$/, '?') + parameters
  }
  return url
}

/**
 * 获取 URL 中的参数
 *
 * 此函数旨在解析给定 URL 中的查询参数，并将其转换为一个键值对对象
 * 如果没有提供 URL，则使用当前页面的 URL 进行解析
 *
 * @param {string} url 可选；要解析的 URL，默认为当前页面的 URL
 * @returns {object} 返回一个包含 URL 查询参数的键值对对象
 */
export function getUrlParams(url?: string): object {
  // 如果没有传入 URL，则使用当前页面的 URL
  url = url || window.location.href

  // 获取问号 (?) 之后的部分
  const queryString = url.split('?')[1]

  // 如果没有查询字符串，则返回空对象
  if (!queryString) return {}

  // 将查询字符串转换为键值对
  const params: any = {}
  queryString.split('&').forEach((param) => {
    const [key, value] = param.split('=')
    params[key] = decodeURIComponent(value)
  })

  return params
}

/**
 * 组合式函数
 * 监听给定名称或名称数组的插槽是否存在，支持监听单个插槽或一组插槽的存在
 *
 * @param {string | string[]} [slotsName = 'default'] - 插槽的名称或名称数组，默认为 'default'
 * @returns 如果是单个插槽名称，则返回一个计算属性，表示该插槽是否存在
 *          如果是插槽名称数组，则返回一个 reactive 对象，其中的每个属性对应该插槽是否存在
 */
import { useSlots, reactive, computed, Comment, Text } from 'vue'
import type { ComputedRef, Reactive, VNode } from 'vue'
type SlotsExistResult<T extends string | string[]> = T extends string
  ? ComputedRef<boolean>
  : Reactive<Record<string, ComputedRef<boolean>>>
export function useSlotsExist<T extends string | string[] = 'default'>(slotsName: T): SlotsExistResult<T> {
  const slots = useSlots() // 获取当前组件的所有插槽
  // 检查特定名称的插槽是否存在且不为空
  const checkSlotsExist = (slotName: string): boolean => {
    const slotsContent = slots[slotName]?.()
    const checkExist = (slotContent: VNode) => {
      if (slotContent.type === Comment) {
        return false
      }
      if (Array.isArray(slotContent.children) && !slotContent.children.length) {
        return false
      }
      if (slotContent.type !== Text) {
        return true
      }
      if (typeof slotContent.children === 'string') {
        return slotContent.children.trim() !== ''
      }
    }
    if (slotsContent && slotsContent?.length) {
      const result = slotsContent.some((slotContent: VNode) => {
        return checkExist(slotContent)
      })
      return result
    }
    return false
  }
  if (Array.isArray(slotsName)) {
    const slotsExist = reactive<Record<string, ComputedRef<boolean>>>({})
    slotsName.forEach((slotName: string) => {
      const exist = computed(() => checkSlotsExist(slotName))
      slotsExist[slotName] = exist // 将一个 ref 赋值给一个 reactive 属性时，该 ref 会自动解包
    })
    return slotsExist as SlotsExistResult<T>
  } else {
    return computed(() => checkSlotsExist(slotsName)) as SlotsExistResult<T>
  }
}

/**
 * 使用 requestAnimationFrame 实现的延迟 setTimeout 或间隔 setInterval 调用函数
 *
 * @param {Function} fn 要执行的函数
 * @param {number} [delay = 0] 延迟的时间，单位为 ms，默认为 0，表示不延迟立即执行
 * @param {boolean} [interval = false] 是否间隔执行，如果为 true，则在首次执行后，以 delay 为间隔持续执行
 * @returns 返回一个对象，包含一个 id 属性，该 id 为 requestAnimationFrame 的调用 ID，可用于取消动画帧
 */
export function rafTimeout(fn: Function, delay: number = 0, interval: boolean = false): { id: number } {
  let start: number | null = null // 记录动画开始的时间戳
  function timeElapse(timestamp: number) {
    // 定义动画帧回调函数
    /*
      timestamp参数：与 performance.now() 的返回值相同，它表示 requestAnimationFrame() 开始去执行回调函数的时刻
    */
    if (!start) {
      // 如果还没有开始时间，则以当前时间为开始时间
      start = timestamp
    }
    const elapsed = timestamp - start
    if (elapsed >= delay) {
      try {
        fn() // 执行目标函数
      } catch (error) {
        console.error('Error executing rafTimeout function:', error)
      }
      if (interval) {
        // 如果需要间隔执行，则重置开始时间并继续安排下一次动画帧
        start = timestamp
        raf.id = requestAnimationFrame(timeElapse)
      }
    } else {
      raf.id = requestAnimationFrame(timeElapse)
    }
  }
  interface AnimationFrameID {
    id: number
  }
  // 创建一个对象用于存储动画帧的 ID，并初始化动画帧
  const raf: AnimationFrameID = {
    id: requestAnimationFrame(timeElapse)
  }
  return raf
}

/**
 * 用于取消 rafTimeout 函数
 *
 * @param raf - 包含请求动画帧 ID 的对象；该 ID 是由 requestAnimationFrame 返回的
 *              该函数旨在取消之前通过 requestAnimationFrame 请求的动画帧
 *              如果传入的 raf 对象或其 id 无效，则会打印警告
 */
export function cancelRaf(raf: { id: number }): void {
  if (raf && raf.id && typeof raf.id === 'number') {
    cancelAnimationFrame(raf.id)
  } else {
    console.warn('cancelRaf received an invalid id:', raf)
  }
}

/**
 * 组合式函数
 * 使用 ResizeObserver 观察 DOM 元素尺寸变化
 *
 * 该函数提供了一种方便的方式来观察一个或多个元素的尺寸变化，并在变化时执行指定的回调函数
 *
 * @param target 要观察的目标，可以是 Ref 对象、Ref 数组、HTMLElement 或 HTMLElement 数组
 * @param callback 当元素尺寸变化时调用的回调函数
 * @param options ResizeObserver 选项，用于定制观察行为
 * @returns 返回一个对象，包含停止和开始观察的方法，使用者可以调用 start 方法开始观察，调用 stop 方法停止观察
 */
import { ref, toValue, watch, onBeforeUnmount, onMounted, getCurrentInstance } from 'vue'
import type { Ref } from 'vue'
export function useResizeObserver(
  target: Ref | Ref[] | HTMLElement | HTMLElement[],
  callback: ResizeObserverCallback,
  options: object = {}
): { start: () => void; stop: () => void } {
  const isSupported = useSupported(() => window && 'ResizeObserver' in window)
  let observer: ResizeObserver | undefined
  const stopObservation = ref(false)
  const targets = computed(() => {
    const targetsValue = toValue(target)
    if (targetsValue) {
      if (Array.isArray(targetsValue)) {
        return targetsValue.map((el: any) => toValue(el)).filter((el: any) => el)
      } else {
        return [targetsValue]
      }
    }
    return []
  })
  // 定义清理函数，用于断开 ResizeObserver 的连接
  const cleanup = () => {
    if (observer) {
      observer.disconnect()
      observer = undefined
    }
  }
  // 初始化 ResizeObserver，开始观察目标元素
  const observeElements = () => {
    if (isSupported.value && targets.value.length && !stopObservation.value) {
      observer = new ResizeObserver(callback)
      targets.value.forEach((element: HTMLElement) => observer!.observe(element, options))
    }
  }
  // 监听 targets 的变化，当 targets 变化时，重新建立 ResizeObserver 观察
  watch(
    () => targets.value,
    () => {
      cleanup()
      observeElements()
    },
    {
      immediate: true, // 立即触发回调，以便初始状态也被观察
      flush: 'post'
    }
  )
  const start = () => {
    stopObservation.value = false
    observeElements()
  }
  const stop = () => {
    stopObservation.value = true
    cleanup()
  }
  // 在组件卸载前清理 ResizeObserver
  onBeforeUnmount(() => cleanup())
  return {
    start,
    stop
  }
}
// 辅助函数
export function useSupported(callback: () => unknown): ComputedRef<boolean> {
  const isMounted = useMounted()
  return computed(() => {
    // to trigger the ref
    isMounted.value
    return Boolean(callback())
  })
}
export function useMounted(): Ref<boolean> {
  const isMounted = ref(false)
  // 获取当前组件的实例
  const instance = getCurrentInstance()
  if (instance) {
    onMounted(() => {
      isMounted.value = true
    }, instance)
  }
  return isMounted
}
