export const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? '/api'

/** 默认请求超时（毫秒）：60 秒 */
const DEFAULT_TIMEOUT = 60000

/**
 * 通用请求封装：拼接 API 地址、自动设置 JSON 请求头（FormData 除外）、
 * 非 2xx 时抛出后端返回的 message，204 或空响应体返回 undefined。
 */
export async function request<T>(
  path: string,
  init?: RequestInit & { timeout?: number },
): Promise<T> {
  const headers = new Headers(init?.headers)
  // 自动设置 Content-Type 头（FormData 除外）
  if (init?.body && !headers.has('Content-Type')) {
    const b = init.body
    const autoTypes = [FormData, URLSearchParams, Blob]
    if (!autoTypes.some((C) => b instanceof C)) {
      headers.set('Content-Type', 'application/json')
    }
  }
  // 自动设置超时时间
  const timeout = init?.timeout ?? DEFAULT_TIMEOUT
  const controller = new AbortController()
  const timer = setTimeout(() => {
    controller.abort(new DOMException('timeout', 'TimeoutError'))
  }, timeout)

  // 把“内部超时”和“调用方取消”两个取消源并联，保证任一条件都能中止 fetch 请求
  const signals = init?.signal
    ? [controller.signal, init.signal]
    : [controller.signal]
  const signal =
    signals.length > 1 ? AbortSignal.any(signals) : controller.signal

  try {
    const res = await fetch(`${API_BASE}${path}`, { ...init, headers, signal })
    if (!res.ok) {
      let message = `请求失败 (${res.status})`
      try {
        const data = (await res.json()) as { message?: string }
        if (data.message) message = data.message
      } catch {
        /* ignore */
      }
      throw new Error(message)
    }
    if (res.status === 204 || res.status === 205) return undefined as T
    const text = await res.text()
    if (!text) return undefined as T
    try {
      return JSON.parse(text) as T
    } catch {
      throw new Error(`响应不是合法 JSON: ${text.slice(0, 100)}`)
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      const reason = controller.signal.reason
      const isTimeout =
        reason instanceof DOMException && reason?.name === 'TimeoutError'
      throw new Error(isTimeout ? '请求超时' : '请求已取消', { cause: error })
    }
    throw error
  } finally {
    clearTimeout(timer)
  }
}

/**
 * 将参数对象序列化为查询字符串（跳过 undefined 与空字符串）。
 */
export function toQuery(
  params: Record<string, string | number | undefined>,
): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      search.set(key, String(value))
    }
  }
  const text = search.toString()
  return text ? `?${text}` : ''
}
