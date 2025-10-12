"use client"

import { ApiError, apiFetch } from '../../lib/api'

class ApiClient {
  async request<T = unknown>(
    endpoint: string,
    options: RequestInit & { json?: unknown } = {}
  ): Promise<T> {
    let url = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`

    // Se estamos no server, transforma em URL absoluta
    if (typeof window === 'undefined') {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
      url = url.startsWith('http') ? url : `${baseUrl}${url}`
    }

    return apiFetch<T>(url, options as any)
  }

  setToken(_: string) {}
  clearToken() {}
  getToken() { return null }
  isAuthenticated() { return false }
}

export const apiClient = new ApiClient()
export { ApiError }
