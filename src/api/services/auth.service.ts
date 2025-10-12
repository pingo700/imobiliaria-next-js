import { LoginRequestSchema, LoginResponseSchema } from '../../api/schemas/user'
import type { LoginRequest, LoginResponse } from '../../api/schemas/user'
import { apiClient } from '../../api/core/client'

type UiUser = { id: number; nome: string; email: string; foto: string | null }

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`))
  return m ? decodeURIComponent(m[1]) : null
}

function writeCookie(name: string, value: string, maxAge = 60 * 60 * 24 * 7) {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; SameSite=Lax; Max-Age=${maxAge}`
}

function clearCookie(name: string) {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=; Path=/; SameSite=Lax; Max-Age=0`
}

function fromB64Url(s: string) {
  try {
    const pad = s.length % 4 ? '='.repeat(4 - (s.length % 4)) : ''
    const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + pad
    const json = atob(b64)
    return JSON.parse(json)
  } catch {
    try { return JSON.parse(s) } catch { return null }
  }
}

function toB64Url(json: unknown) {
  try {
    const s = JSON.stringify(json)
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
  } catch { return '' }
}

export const authService = {
  async login(credentials: LoginRequest & { csrfToken?: string }): Promise<LoginResponse> {
    const validated = LoginRequestSchema.parse({ email: credentials.email, senha: credentials.senha })
    const response = await apiClient.request<LoginResponse>('/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...(credentials.csrfToken ? { 'x-csrf-token': credentials.csrfToken } : {}) },
      body: JSON.stringify({ ...validated, csrfToken: credentials.csrfToken }),
    })
    const parsed = LoginResponseSchema.parse(response)
    try {
      if (typeof window !== 'undefined') {
        const ui: UiUser = (parsed as any).user ?? { id: 0, nome: '', email: '', foto: null }
        localStorage.setItem('user_data', JSON.stringify(ui))
        writeCookie('ui_user', toB64Url(ui))
      }
      // NÃO escrever auth_token no cliente; cookie HttpOnly já foi setado pelo backend
    } catch {}
    return parsed
  },

  async logout(): Promise<void> {
    await apiClient.request('/auth/logout', { method: 'POST' })
    try {
      if (typeof window !== 'undefined') localStorage.removeItem('user_data')
      clearCookie('ui_user')
      // NÃO precisa limpar auth_token aqui (servidor já limpou)
    } catch {}
  },

  getCurrentUser(): UiUser | null {
    const raw = readCookie('ui_user')
    if (raw) {
      const u = fromB64Url(raw)
      if (u && typeof u.id === 'number') return u as UiUser
    }
    try {
      if (typeof window !== 'undefined') {
        const s = localStorage.getItem('user_data')
        return s ? (JSON.parse(s) as UiUser) : null
      }
    } catch {}
    return null
  },

  setClientUser(u: UiUser) {
    writeCookie('ui_user', toB64Url(u))
    try { if (typeof window !== 'undefined') localStorage.setItem('user_data', JSON.stringify(u)) } catch {}
  },
  clearClientUser() {
    clearCookie('ui_user')
    try { if (typeof window !== 'undefined') localStorage.removeItem('user_data') } catch {}
  },
}
