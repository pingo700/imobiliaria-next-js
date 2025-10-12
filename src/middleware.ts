import { NextRequest, NextResponse } from 'next/server'

const dev = process.env.NODE_ENV !== 'production'

function genNonce() {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  let s = ''
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i])
  return btoa(s)
}

function cspDev() {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data:",
    "style-src 'self' 'unsafe-inline' blob: data:",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https: http: ws: wss:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')
}

function cspProd(nonce: string) {
  const n = `'nonce-${nonce}'`
  return [
    "default-src 'self'",
    `script-src 'self' ${n} 'strict-dynamic' https:`,
    `style-src 'self' ${n}`,
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https: wss:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join('; ')
}

export function middleware(req: NextRequest) {
  if (dev) {
    const res = NextResponse.next()
    res.headers.set('Content-Security-Policy', cspDev())
    return res
  }
  const nonce = genNonce()
  const reqHeaders = new Headers(req.headers)
  reqHeaders.set('x-nonce', nonce)
  const res = NextResponse.next({ request: { headers: reqHeaders } })
  res.headers.set('Content-Security-Policy', cspProd(nonce))
  res.headers.set('x-nonce', nonce)
  return res
}

export const config = {
  matcher: [
    {
      source:
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
