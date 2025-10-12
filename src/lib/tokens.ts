export const isProd = process.env.NODE_ENV === 'production'

export const ACCESS_TOKEN_MAX_AGE = 60 * 15
export const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30

export const ACCESS_COOKIE_NAME = 'auth_token'
export const REFRESH_COOKIE_NAME = 'refresh_token'
export const CSRF_COOKIE_NAME = 'csrf_token'

export const accessCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: ACCESS_TOKEN_MAX_AGE,
}

export const refreshCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax' as const,
  path: '/api/auth/refresh',
  maxAge: REFRESH_TOKEN_MAX_AGE,
}
