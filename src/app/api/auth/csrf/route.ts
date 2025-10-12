import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { randomBytes } from 'crypto'
import { CSRF_COOKIE_NAME } from '@/lib/tokens'

export const runtime = 'nodejs'

export async function GET() {
  const jar = await cookies()
  const existing = jar.get(CSRF_COOKIE_NAME)?.value
  const token = existing && existing.length >= 32 ? existing : randomBytes(32).toString('hex')
  jar.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 30,
  })
  return NextResponse.json({ token }, { headers: { 'cache-control': 'no-store' } })
}
