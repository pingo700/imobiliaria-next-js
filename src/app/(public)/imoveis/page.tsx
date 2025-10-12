import { Suspense } from 'react'
import ImoveisClient from './ImoveisClient'

export default function Page({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const initial = {
    search: (searchParams.query as string) || '',
    type: (searchParams.categoria as string) || 'all',
    minPrice: (searchParams.preco_min as string) || '',
    maxPrice: (searchParams.preco_max as string) || '',
    bedrooms: (searchParams.quartos_min as string) || 'all',
    estado: (searchParams.estado_id as string) || 'all',
    cidade: (searchParams.cidade_id as string) || 'all',
  }
  return <ImoveisClient initialFilters={initial} />
}
