import { redirect } from 'next/navigation'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { ACCESS_COOKIE_NAME } from './tokens'

type RequireAuthOpts = { next?: string; role?: 'admin' | 'user' }

function parseJwt(token: string) {
  try {
    const [, p] = token.split('.')
    if (!p) return null
    const pad = p.length % 4 ? '='.repeat(4 - (p.length % 4)) : ''
    const json = Buffer.from(p.replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64').toString('utf8')
    return JSON.parse(json) as { exp?: number }
  } catch { return null }
}

function isAccessValid(token: string | null) {
  if (!token) return false
  const payload = parseJwt(token)
  if (!payload || typeof payload.exp !== 'number') return false
  const now = Math.floor(Date.now() / 1000)
  // margem de 30s para evitar corridas
  return payload.exp > (now + 30)
}

export const getAuth = cache(async () => {
  const jar = await cookies()
  const token = jar.get(ACCESS_COOKIE_NAME)?.value || null
  const valid = isAccessValid(token)
  return { token: valid ? token : null, isAuthenticated: valid }
})

export async function requireAuth(opts: RequireAuthOpts = {}) {
  const jar = await cookies()
  const token = jar.get(ACCESS_COOKIE_NAME)?.value || null
  const valid = isAccessValid(token)
  if (!valid) {
    const q = opts.next ? `?next=${encodeURIComponent(opts.next)}` : ''
    redirect(`/login${q}`)
  }
}
