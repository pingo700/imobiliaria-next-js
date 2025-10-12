import { NextResponse, NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { env } from '@/lib/env'
import {
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  accessCookieOptions,
  refreshCookieOptions,
} from '@/lib/tokens'

export const runtime = 'nodejs'

function pickSafeUser(raw: any) {
  const id = Number(raw?.user?.id ?? raw?.id ?? raw?.userId ?? raw?.usu_id ?? 0) || 0
  const nome = raw?.user?.nome ?? raw?.user?.name ?? raw?.nome ?? raw?.name ?? ''
  const email = raw?.user?.email ?? raw?.email ?? raw?.usu_email ?? ''
  const foto = raw?.user?.foto ?? raw?.user?.photo ?? raw?.foto ?? raw?.photo ?? null
  return { id, nome, email, foto }
}

function readCookieFromHeader(setCookieHeader: string, name: string) {
  const m = setCookieHeader.match(new RegExp(`${name}=([^;]+)`))
  return m ? m[1] : null
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin')
  if (origin && origin !== req.nextUrl.origin) return new NextResponse(null, { status: 403 })

  const ct = req.headers.get('content-type') || ''
  let body: any = {}
  if (ct.includes('application/json')) {
    body = await req.json().catch(() => ({}))
  } else {
    const fd = await req.formData().catch(() => null)
    body = fd ? Object.fromEntries(fd as any) : {}
  }

  const jar = await cookies()
  const cookieToken = jar.get('csrf_token')?.value || ''
  const headerToken = req.headers.get('x-csrf-token') || ''
  const formToken = body.csrfToken || ''
  const csrfToken = headerToken || formToken
  if (!cookieToken || !csrfToken || cookieToken !== csrfToken) {
    return new NextResponse(null, { status: 403 })
  }

  const email = body.email || ''
  const senha = body.senha || body.password || ''

  const upstream = await fetch(`${env.API_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, senha }),
    redirect: 'manual',
  })

  const data = await upstream.json().catch(() => ({}))
  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status })
  }

  const setCookieHeader = upstream.headers.get('set-cookie') || ''
  const access =
    String(data.token || data.accessToken || '') ||
    readCookieFromHeader(setCookieHeader, ACCESS_COOKIE_NAME) ||
    ''
  const refresh =
    String(data.refreshToken || data.refresh_token || '') ||
    readCookieFromHeader(setCookieHeader, REFRESH_COOKIE_NAME) ||
    ''

  if (!access) {
    return NextResponse.json({ message: 'Token inválido' }, { status: 401 })
  }

  jar.set(ACCESS_COOKIE_NAME, access, accessCookieOptions)
  if (refresh) {
    jar.set(REFRESH_COOKIE_NAME, refresh, refreshCookieOptions)
  }

  const safeUser = pickSafeUser(data.user ?? data)
  jar.set('ui_user', encodeURIComponent(JSON.stringify(safeUser)), {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  const ci = readCookieFromHeader(setCookieHeader, 'ci_session')
  if (ci) {
    jar.set('ci_session', ci, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 2,
    })
  }

  return NextResponse.json({ status: 'success', user: safeUser })
}
