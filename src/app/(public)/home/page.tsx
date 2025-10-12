import { PropertySchema } from "@/api/schemas/property"
import { apiPath } from "@/lib/url"
import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query"
import HomeClient from "./home-client"

//export const dynamic = 'force-dynamic'

async function getList() {
  try {
    const res = await fetch(apiPath('/imoveis'), { cache: 'no-store' })

    if (!res.ok) {
      console.warn('Falha ao buscar imóveis:', res.status)
      return [] // retorna vazio se houver erro
    }

    const data = await res.json()
    const payload = data?.data ?? data
    return PropertySchema.array().parse(payload)
  } catch (err) {
    console.error('Erro ao buscar imóveis:', err)
    return [] // retorna vazio em caso de exceção
  }
}


export default async function Page() {
  const list = await getList()

  const qc = new QueryClient()
  await qc.prefetchQuery({
    queryKey: ["public-properties", { limit: undefined }],
    queryFn: async () => list,
  })

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <HomeClient />
    </HydrationBoundary>
  )
}
