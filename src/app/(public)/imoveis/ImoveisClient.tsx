'use client'
import { useState, useMemo, useDeferredValue, useCallback, memo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Bed, Bath, Scan, MapPin, Search, AlertCircle, Loader2, RefreshCw, ImageIcon } from 'lucide-react'
import { useEstados, useCidades, usePropertySearch } from '@/api'
import type { Property } from '@/api'

const PROPERTY_TYPES = ['Casa', 'Apartamento', 'Terreno', 'Comercial', 'Condomínio', 'Estúdio', 'Loft', 'Kitnet'] as const
const BEDROOM_OPTIONS = ['1', '2', '3', '4', '5'] as const

type Filters = {
  search: string
  type: string
  minPrice: string
  maxPrice: string
  bedrooms: string
  estado: string
  cidade: string
}

const INITIAL_FILTERS: Filters = {
  search: '',
  type: 'all',
  minPrice: '',
  maxPrice: '',
  bedrooms: 'all',
  estado: 'all',
  cidade: 'all',
}

type Props = { initialFilters: Filters }

const formatBRL = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n || 0)

const PropertySkeleton = memo(() => (
  <Card className="overflow-hidden">
    <Skeleton className="h-[220px] w-full" />
    <CardContent className="p-6">
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-6 w-1/2 mb-2" />
      <Skeleton className="h-6 w-1/4 mb-4" />
      <div className="flex justify-between">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>
    </CardContent>
    <CardFooter className="border-t p-6">
      <Skeleton className="h-10 w-full" />
    </CardFooter>
  </Card>
))

const FilterSkeleton = memo(() => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-8">
    {Array.from({ length: 8 }, (_, i) => (
      <Skeleton key={i} className="h-10 w-full" />
    ))}
  </div>
))

const PropertyImage = memo<{
  url?: string
  title: string
  status: string
  featuresCount: number
}>(({ url, title, status, featuresCount }) => (
  <div className="relative h-[220px] w-full bg-muted">
    {url ? (
      <img
        src={url}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
        onError={(e) => {
          e.currentTarget.style.display = 'none'
        }}
      />
    ) : (
      <div className="absolute inset-0 w-full h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <ImageIcon className="mx-auto h-12 w-12 mb-2 opacity-50" />
          <p className="text-sm">Sem imagem</p>
        </div>
      </div>
    )}
    <Badge className="absolute right-2 top-2">{status}</Badge>
    {featuresCount > 0 && (
      <Badge variant="secondary" className="absolute left-2 top-2">
        {featuresCount} característica{featuresCount !== 1 ? 's' : ''}
      </Badge>
    )}
  </div>
))

const PropertyCard = memo<{ p: Property }>(({ p }) => {
  const slug = p.slug || String(p.id)
  const status = p.details?.status || 'À venda'
  const bedrooms = p.details?.bedrooms ?? 0
  const bathrooms = p.details?.bathrooms ?? 0
  const area = p.details?.usableArea ?? 0
  const firstImage = p.images?.[0]
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <PropertyImage
        url={firstImage}
        title={p.name}
        status={status}
        featuresCount={p.features?.length || 0}
      />
      <CardContent className="p-6">
        <div className="mb-2 flex items-center text-muted-foreground">
          <MapPin className="mr-1 h-4 w-4 flex-shrink-0" />
          <span className="text-sm truncate">
            {[p.address, p.location?.city, p.location?.state].filter(Boolean).join(', ')}
          </span>
        </div>
        <h3 className="mb-2 text-xl font-bold line-clamp-2 min-h-[3.5rem]">{p.name}</h3>
        <p className="mb-4 text-xl font-bold text-primary">{formatBRL(p.price)}</p>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center">
            <Bed className="mr-1 h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span>
              {bedrooms} quarto{bedrooms !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center">
            <Bath className="mr-1 h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span>
              {bathrooms} banheiro{bathrooms !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center">
            <Scan className="mr-1 h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span>{area}m²</span>
          </div>
        </div>
        {p.features?.length ? (
          <div className="mt-3 flex flex-wrap gap-1">
            {p.features.slice(0, 3).map((f, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {f}
              </Badge>
            ))}
            {p.features.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{p.features.length - 3}
              </Badge>
            )}
          </div>
        ) : null}
      </CardContent>
      <CardFooter className="border-t mt-auto">
        <Button asChild className="w-full">
          <Link href={`/imoveis/${slug}`}>Ver Detalhes</Link>
        </Button>
      </CardFooter>
    </Card>
  )
})

export default function ImoveisClient({ initialFilters }: Props) {
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS)
  const deferred = useDeferredValue(filters)

  const estados = useEstados()
  const cidades = useCidades()

  const params = useMemo(() => {
    const p: any = {}
    if (deferred.search.trim()) p.query = deferred.search.trim()
    if (deferred.type !== 'all') p.categoria = deferred.type
    if (deferred.minPrice.trim()) p.preco_min = Number(deferred.minPrice)
    if (deferred.maxPrice.trim()) p.preco_max = Number(deferred.maxPrice)
    if (deferred.estado !== 'all') p.estado_id = Number(deferred.estado)
    if (deferred.cidade !== 'all') p.cidade_id = Number(deferred.cidade)
    if (deferred.bedrooms !== 'all') p.quartos_min = Number(deferred.bedrooms)
    return p
  }, [deferred])

  const propertiesQuery = usePropertySearch(params)

  const filteredCidades = useMemo(() => {
    const all = cidades.data || []
    if (!filters.estado || filters.estado === 'all') return all
    const id = Number(filters.estado)
    return all.filter((c) => c.stateId === id)
  }, [cidades.data, filters.estado])

  const activeFilters = useMemo(() => {
    const entries: { key: keyof Filters; display: string }[] = []
    if (filters.search.trim()) entries.push({ key: 'search', display: `"${filters.search.trim()}"` })
    if (filters.type !== 'all') entries.push({ key: 'type', display: filters.type })
    if (filters.minPrice.trim())
      entries.push({ key: 'minPrice', display: `Min: ${formatBRL(Number(filters.minPrice))}` })
    if (filters.maxPrice.trim())
      entries.push({ key: 'maxPrice', display: `Max: ${formatBRL(Number(filters.maxPrice))}` })
    if (filters.bedrooms !== 'all')
      entries.push({ key: 'bedrooms', display: `${filters.bedrooms}+ quartos` })
    if (filters.estado !== 'all') {
      const e = (estados.data || []).find((x) => String(x.id) === filters.estado)
      entries.push({ key: 'estado', display: e?.name || filters.estado })
    }
    if (filters.cidade !== 'all') {
      const c = (cidades.data || []).find((x) => String(x.id) === filters.cidade)
      entries.push({ key: 'cidade', display: c?.name || filters.cidade })
    }
    return entries
  }, [filters, estados.data, cidades.data])

  const updateFilter = useCallback((name: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }))
  }, [])

  const clearFilters = useCallback(() => setFilters(INITIAL_FILTERS), [])

  const handleRefresh = useCallback(() => {
    propertiesQuery.refetch()
  }, [propertiesQuery])

  const loadingFilters = estados.isLoading || cidades.isLoading
  const loading = propertiesQuery.isLoading
  const fetching = propertiesQuery.isFetching
  const error = propertiesQuery.error as Error | null
  const properties = (propertiesQuery.data || []) as Property[]
  const total = properties.length

  return (
    <div className="container py-8 md:py-12 px-4 md:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Propriedades</h1>
          <p className="text-muted-foreground mt-1">
            {loading
              ? 'Carregando...'
              : `${total} ${total === 1 ? 'propriedade encontrada' : 'propriedades encontradas'}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={fetching} size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${fetching ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button variant="outline" onClick={clearFilters} size="sm">
            Limpar Filtros
          </Button>
        </div>
      </div>

      <div className="mb-6 md:mb-8 rounded-lg border bg-background p-4 md:p-6">
        <h2 className="mb-4 text-xl font-bold">Encontre sua propriedade ideal</h2>
        {loadingFilters ? (
          <FilterSkeleton />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-8">
            <div className="xl:col-span-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar propriedades..."
                  className="pl-8"
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                />
              </div>
            </div>

            <Select value={filters.type} onValueChange={(v) => updateFilter('type', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {PROPERTY_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.estado} onValueChange={(v) => updateFilter('estado', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os estados</SelectItem>
                {(estados.data || []).map((e) => (
                  <SelectItem key={e.id} value={String(e.id)}>
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.cidade}
              onValueChange={(v) => updateFilter('cidade', v)}
              disabled={!filters.estado || filters.estado === 'all'}
            >
              <SelectTrigger>
                <SelectValue placeholder="Cidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as cidades</SelectItem>
                {filteredCidades.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="number"
              placeholder="Preço mín."
              value={filters.minPrice}
              onChange={(e) => updateFilter('minPrice', e.target.value)}
            />
            <Input
              type="number"
              placeholder="Preço máx."
              value={filters.maxPrice}
              onChange={(e) => updateFilter('maxPrice', e.target.value)}
            />

            <Select value={filters.bedrooms} onValueChange={(v) => updateFilter('bedrooms', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Quartos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Qualquer</SelectItem>
                {BEDROOM_OPTIONS.map((n) => (
                  <SelectItem key={n} value={n}>
                    {n}+
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {activeFilters.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {activeFilters.map(({ key, display }) => (
              <Badge
                key={key}
                variant="secondary"
                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                onClick={() =>
                  updateFilter(
                    key,
                    key === 'minPrice' || key === 'maxPrice' || key === 'search' ? '' : 'all'
                  )
                }
              >
                {display} ×
              </Badge>
            ))}
          </div>
        )}
      </div>

      {error && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error.message}
            <Button variant="outline" size="sm" className="ml-4" onClick={handleRefresh}>
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {loading && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <PropertySkeleton key={i} />
          ))}
        </div>
      )}

      {!loading && !error && properties.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((p) => (
            <PropertyCard key={p.id} p={p} />
          ))}
        </div>
      )}

      {!loading && !error && properties.length === 0 && (
        <div className="rounded-lg border bg-background p-8 text-center">
          <div className="mx-auto mb-4 h-12 w-12 text-muted-foreground">
            <Search className="h-full w-full" />
          </div>
          <h3 className="mb-2 text-xl font-bold">Nenhuma propriedade encontrada</h3>
          <p className="text-muted-foreground mb-4">
            Tente ajustar os filtros de busca para encontrar propriedades.
          </p>
          <Button onClick={clearFilters} variant="outline">
            Limpar todos os filtros
          </Button>
        </div>
      )}

      {fetching && properties.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-background border rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Atualizando resultados...
          </div>
        </div>
      )}
    </div>
  )
}
