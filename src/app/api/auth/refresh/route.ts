import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { env } from '@/lib/env'
import {
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  accessCookieOptions,
  refreshCookieOptions,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
} from '@/lib/tokens'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin')
  if (origin && origin !== req.nextUrl.origin) return new NextResponse(null, { status: 403 })

  const jar = await cookies()
  const refresh = jar.get(REFRESH_COOKIE_NAME)?.value
  if (!refresh) return NextResponse.json({ message: 'No refresh token' }, { status: 401 })

  const endpoints = [`${env.API_BASE_URL}/refresh`, `${env.API_BASE_URL}/auth/refresh`]
  let ok = false
  let access = ''
  let newRefresh = ''

  for (const url of endpoints) {
    const u = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${refresh}` },
      body: JSON.stringify({ refreshToken: refresh }),
    }).catch(() => null)
    if (u && u.ok) {
      const j = await u.json().catch(() => ({}))
      access = String(j.token || j.accessToken || '')
      newRefresh = String(j.refreshToken || j.refresh_token || '')
      ok = Boolean(access)
      if (ok) break
    }
  }

  if (!ok) {
    jar.set(ACCESS_COOKIE_NAME, '', { ...accessCookieOptions, maxAge: 0 })
    jar.set(REFRESH_COOKIE_NAME, '', { ...refreshCookieOptions, maxAge: 0 })
    return NextResponse.json({ message: 'Refresh failed' }, { status: 401 })
  }

  jar.set(ACCESS_COOKIE_NAME, access, { ...accessCookieOptions, maxAge: ACCESS_TOKEN_MAX_AGE })
  if (newRefresh) {
    jar.set(REFRESH_COOKIE_NAME, newRefresh, { ...refreshCookieOptions, maxAge: REFRESH_TOKEN_MAX_AGE })
  }

  return NextResponse.json({ status: 'ok' })
}
