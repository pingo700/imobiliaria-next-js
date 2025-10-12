import { headers } from 'next/headers'

const ENV_BASE =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.APP_URL ||
  'http://localhost:3000'

function ensureLeadingSlash(path: string) {
  return path.startsWith('/') ? path : `/${path}`
}

function prefixApi(path: string) {
  const p = ensureLeadingSlash(path)
  return p.startsWith('/api') ? p : `/api${p}`
}

export function absoluteUrl(path: string) {
  return new URL(ensureLeadingSlash(path), ENV_BASE).toString()
}

export function apiPath(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  if (typeof window === "undefined") {
    if (process.env.NODE_ENV === "development" && path === "/imoveis") {
      return `${baseUrl}/mock/imoveis.json`;
    }
    return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
  }

  return path.startsWith("/") ? path : `/${path}`;
}


export async function absoluteUrlAsync(path: string) {
  if (ENV_BASE) return new URL(ensureLeadingSlash(path), ENV_BASE).toString()
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000'
  const proto = h.get('x-forwarded-proto') ?? (host.includes('localhost') ? 'http' : 'https')
  return new URL(ensureLeadingSlash(path), `${proto}://${host}`).toString()
}

export async function apiUrlAsync(path: string) {
  return absoluteUrlAsync(prefixApi(path))
}
