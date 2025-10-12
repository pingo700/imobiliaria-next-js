export const runtime = 'nodejs'

type Ctx = { params: Promise<{ path?: string[] }> }

function apiBase() {
  const raw = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || ''
  if (!/^https?:\/\//i.test(raw)) throw new Error('Missing API_BASE_URL')
  return raw.replace(/\/+$/, '')
}

function join(segs: string[]) {
  return segs.map(s => s.replace(/^\/+|\/+$/g, '')).filter(Boolean).join('/')
}

function parseCookies(h: string | null) {
  const o: Record<string, string> = {}
  if (!h) return o
  h.split(';').forEach(p => {
    const i = p.indexOf('=')
    if (i > -1) o[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1))
  })
  return o
}

function parseB64Ui(val: string) {
  try {
    const pad = val.length % 4 ? '='.repeat(4 - (val.length % 4)) : ''
    const b64 = val.replace(/-/g, '+').replace(/_/g, '/') + pad
    const s = Buffer.from(b64, 'base64').toString('utf8')
    return JSON.parse(s)
  } catch {
    try { return JSON.parse(val) } catch { return null }
  }
}

function parseJwtId(token: string): number | undefined {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return undefined
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const pad = b64.length % 4 ? '='.repeat(4 - (b64.length % 4)) : ''
    const json = Buffer.from(b64 + pad, 'base64').toString('utf8')
    const p = JSON.parse(json)
    const id = Number(p?.id ?? p?.user_id ?? p?.uid ?? p?.sub)
    return Number.isFinite(id) ? id : undefined
  } catch { return undefined }
}

async function resolveUserId(base: string, token: string, cookies: Record<string, string>) {
  try {
    if (cookies['ui_user']) {
      const u = parseB64Ui(cookies['ui_user'])
      const n = Number(u?.id)
      if (Number.isFinite(n)) return n
    }
  } catch {}
  if (token) {
    const fromJwt = parseJwtId(token)
    if (fromJwt != null) return fromJwt
  }
  if (!token) return undefined
  try {
    const r = await fetch(new URL('/auth/me', base), {
      method: 'GET',
      headers: { accept: 'application/json', authorization: `Bearer ${token}`, 'accept-encoding': 'identity' },
      redirect: 'manual'
    })
    if (!r.ok) return undefined
    const ct = r.headers.get('content-type') || ''
    const d: any = ct.includes('application/json') ? await r.json() : await r.text().then(t => { try { return JSON.parse(t) } catch { return {} } })
    const id = Number(d?.id ?? d?.user?.id ?? d?.sub)
    return Number.isFinite(id) ? id : undefined
  } catch { return undefined }
}

function needsAuditPath(pathname: string) {
  return pathname.includes('/admin/cadastrar') || pathname.includes('/admin/editar')
}

async function forward(req: Request, segs: string[]) {
  const base = apiBase()
  const src = new URL(req.url)
  const url = new URL(`/${join(segs)}${src.search}`, base)

  const cookies = parseCookies(req.headers.get('cookie'))
  const token = cookies['auth_token'] || ''

  const method = req.method.toUpperCase()
  const ct = req.headers.get('content-type') || ''
  const isJson = ct.includes('application/json')
  const isMultipart = ct.includes('multipart/form-data')
  const isUrlencoded = ct.includes('application/x-www-form-urlencoded')
  const audit = needsAuditPath(url.pathname)

  const uid = audit ? await resolveUserId(base, token, cookies) : undefined

  let body: BodyInit | undefined
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    if (isJson) {
      const raw = await req.text()
      const data = raw ? JSON.parse(raw) : {}
      if (audit && uid != null) {
        if (data.usu_created == null) data.usu_created = uid
        if (data.usu_updated == null) data.usu_updated = uid
      }
      body = JSON.stringify(data)
    } else if (isMultipart) {
      const fd = await req.formData().catch(() => null)
      if (fd && audit && uid != null) {
        if (!fd.has('usu_created')) fd.append('usu_created', String(uid))
        if (!fd.has('usu_updated')) fd.append('usu_updated', String(uid))
      }
      body = fd ?? await req.arrayBuffer()
    } else if (isUrlencoded) {
      const text = await req.text()
      const usp = new URLSearchParams(text)
      if (audit && uid != null) {
        if (!usp.has('usu_created')) usp.set('usu_created', String(uid))
        if (!usp.has('usu_updated')) usp.set('usu_updated', String(uid))
      }
      body = usp
    } else {
      const buff = await req.arrayBuffer()
      body = buff
    }
  }

  const headers = new Headers(req.headers)
  headers.set('accept', 'application/json')
  headers.set('accept-encoding', 'identity')
  headers.delete('content-length')
  headers.delete('content-encoding')
  if (isJson) headers.set('content-type', 'application/json')
  else if (body instanceof FormData) headers.delete('content-type')
  else if (isUrlencoded) headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8')
  if (token && !headers.has('authorization')) headers.set('authorization', `Bearer ${token}`)
  if (uid != null) headers.set('x-user-id', String(uid))
  headers.set('host', new URL(base).host)

  return fetch(url, { method, headers, body, redirect: 'manual' })
}

export async function GET(req: Request, ctx: Ctx) { const { path = [] } = await ctx.params; return forward(req, path) }
export async function POST(req: Request, ctx: Ctx) { const { path = [] } = await ctx.params; return forward(req, path) }
export async function PUT(req: Request, ctx: Ctx) { const { path = [] } = await ctx.params; return forward(req, path) }
export async function PATCH(req: Request, ctx: Ctx) { const { path = [] } = await ctx.params; return forward(req, path) }
export async function DELETE(req: Request, ctx: Ctx) { const { path = [] } = await ctx.params; return forward(req, path) }
export async function HEAD(req: Request, ctx: Ctx) { const { path = [] } = await ctx.params; return forward(req, path) }
export async function OPTIONS(req: Request, ctx: Ctx) { const { path = [] } = await ctx.params; return forward(req, path) }
