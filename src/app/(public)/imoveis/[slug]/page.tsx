import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PropertyDetailClient from './PropertyDetailClient'
import { headers } from 'next/headers'

import { PropertySchema, type Property } from '@/api/schemas/property'

const ENV_BASE = process.env.NEXT_PUBLIC_APP_URL
const propertyTags = (slug: string) => ['properties', `property:${slug}`] as const

async function buildAbsoluteApiUrl(path: string): Promise<string> {
  if (ENV_BASE) return new URL(path, ENV_BASE).toString()
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000'
  const proto = h.get('x-forwarded-proto') ?? (host.includes('localhost') ? 'http' : 'https')
  return new URL(path, `${proto}://${host}`).toString()
}

async function getProperty(slug: string): Promise<Property> {
  const isDev = process.env.NODE_ENV === "development";
  const url = isDev
    ? `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/mock/imoveis.json`
    : await buildAbsoluteApiUrl(`api/imoveis/${encodeURIComponent(slug)}`);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Falha ao buscar imóvel: ${res.status} ${res.statusText}`);

  const json = await res.json();

  // Se estiver no mock, filtra o imóvel pelo slug
  const payload = isDev ? json.find((p: any) => p.slug === slug) : ('data' in json ? json.data : json);

  return PropertySchema.parse(payload);
}

type PageProps = {
  params: Promise<{ slug: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  try {
    const p = await getProperty(slug)
    const title = `${p.name} | Imobiliária Sistema`
    const description =
      p.details?.description?.slice(0, 160) ||
      [p.category, p.location?.neighborhood, p.location?.city, p.location?.state].filter(Boolean).join(' • ')
    const images = p.images?.length ? [p.images[0]] : undefined
    const canonical = `/imoveis/${encodeURIComponent(slug)}`
    const absoluteCanonical = new URL(canonical, ENV_BASE).toString()
    return {
      title,
      description,
      alternates: { canonical: absoluteCanonical },
      openGraph: { title, description, url: absoluteCanonical, type: 'article', images },
      twitter: { card: 'summary_large_image', title, description, images },
    }
  } catch {
    return { title: 'Imóvel | Imobiliária Sistema', description: 'Detalhes do imóvel.' }
  }
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params
  const property = await getProperty(slug)
  return <PropertyDetailClient property={property} />
}
