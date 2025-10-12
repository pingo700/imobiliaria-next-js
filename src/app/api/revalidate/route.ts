import { revalidateTag } from 'next/cache'

export async function POST(req: Request) {
  const { tag, tags } = await req.json().catch(() => ({}))
  const list: string[] = Array.isArray(tags) ? tags : tag ? [tag] : []
  for (const t of list) revalidateTag(t)
  return Response.json({ revalidated: true, tags: list })
}
