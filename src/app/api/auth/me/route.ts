import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { env } from '@/lib/env'

export const runtime = 'nodejs'

function fromB64Url(s: string) {
  try {
    const pad = s.length % 4 ? '='.repeat(4 - (s.length % 4)) : ''
    const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + pad
    const json = Buffer.from(b64, 'base64').toString('utf8')
    return JSON.parse(json)
  } catch { return null }
}

function pickSafeUser(raw: any) {
  const id = Number(raw?.id ?? raw?.user?.id ?? raw?.user_id ?? raw?.sub ?? raw?.uid ?? 0) || 0
  const nome = raw?.nome ?? raw?.name ?? raw?.user?.nome ?? ''
  const email = raw?.email ?? raw?.mail ?? raw?.user?.email ?? ''
  const foto = raw?.foto ?? raw?.photo ?? raw?.picture ?? raw?.user?.foto ?? null
  return id ? { id, nome, email, foto } : null
}

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
  return payload.exp > (now + 30)
}

async function fetchUpstreamUser(token: string | null) {
  if (!token) return null
  try {
    const r = await fetch(`${env.API_BASE_URL}/auth/me`, {
      headers: { accept: 'application/json', authorization: `Bearer ${token}`, 'accept-encoding': 'identity' },
      redirect: 'manual',
    })
    if (!r.ok) return null
    const j = await r.json().catch(() => null)
    return pickSafeUser(j ?? {})
  } catch { return null }
}

export async function GET() {
  const jar = await cookies()
  const token = jar.get('auth_token')?.value || null
  const rawUi = jar.get('ui_user')?.value || null

  let user = rawUi ? (fromB64Url(rawUi) || null) : null
  if (!user) {
    const payload = token ? parseJwt(token) : null
    user = pickSafeUser(payload ?? {}) || null
  }
  if (!user) {
    user = await fetchUpstreamUser(token)
  }

  const authenticated = isAccessValid(token)
  return NextResponse.json({ status: 'success', authenticated, user: user ?? null })
}
