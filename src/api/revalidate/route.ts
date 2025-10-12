import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { revalidateTag } from 'next/cache'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const has = (await cookies()).get('auth_token')?.value
  if (!has) return NextResponse.json({ status: 'error' }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const tags: string[] = Array.isArray(body?.tags) ? body.tags : []
  tags.forEach(t => revalidateTag(t))
  return NextResponse.json({ status: 'success' })
}
