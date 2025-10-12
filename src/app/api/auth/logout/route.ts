import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME } from '@/lib/tokens'

export const runtime = 'nodejs'

export async function POST() {
  const jar = await cookies()
  jar.set(ACCESS_COOKIE_NAME, '', { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 0 })
  jar.set(REFRESH_COOKIE_NAME, '', { httpOnly: true, secure: true, sameSite: 'lax', path: '/api/auth/refresh', maxAge: 0 })
  jar.set('ui_user', '', { httpOnly: false, secure: true, sameSite: 'lax', path: '/', maxAge: 0 })
  jar.set('ci_session', '', { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 0 })
  return NextResponse.json({ status: 'success' })
}
