export class ApiError extends Error {
  status: number
  data: unknown
  headers: Headers
  constructor(message: string, status: number, data: unknown, headers: Headers) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
    this.headers = headers
  }
}

export async function apiFetch<T = unknown>(input: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const headers = new Headers(init.headers)
  let body = init.body
  if (init.json !== undefined) {
    headers.set('content-type', 'application/json')
    body = JSON.stringify(init.json)
  }
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData
  if (isForm) headers.delete('content-type')

  const doFetch = () => fetch(input, { ...init, headers, body, credentials: init.credentials ?? 'same-origin', cache: init.cache ?? 'no-store' })

  let res = await doFetch()
  if (!res.ok && (res.status === 401 || res.status === 403)) {
    try {
      const rf = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include', cache: 'no-store' })
      if (rf.ok) res = await doFetch()
    } catch {}
  }

  const ct = res.headers.get('content-type') || ''
  const isJson = ct.includes('application/json')
  const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null)

  if (!res.ok) {
    const base = isJson ? (data?.message || data?.error || data?.status) : String(data || '')
    const detail = base ? String(base) : `HTTP ${res.status}`
    throw new ApiError(detail, res.status, data, res.headers)
  }
  return data as T
}
