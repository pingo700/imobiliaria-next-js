'use client'

import type React from 'react'
import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DualSlider } from '@/components/ui/dual-slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Search, MapPin, Building2, X, HomeIcon as House } from 'lucide-react'
import { useCidades, useBairros } from '@/api'

interface Filters {
  tipo: string
  cidade: string
  bairro: string
  priceRange: [number, number]
}

export const PROPERTY_TYPES = [
  'Apartamento',
  'Casa',
  'Comercial',
  'Terreno',
  'Kitnet',
] as const

const TYPE_UI = [
  { value: 'all',          label: 'Todos' },
  { value: 'apartamento',  label: 'Apartamento' },
  { value: 'casa',         label: 'Casa' },
  { value: 'comercial',    label: 'Comercial' },
  { value: 'terreno',      label: 'Terreno' },
  { value: 'kitnet',       label: 'Kitnet' },
] as const

const TYPE_TO_API: Record<string, string | null> = {
  all: null,
  apartamento: 'Apartamento',
  casa: 'Casa',
  comercial: 'Comercial',
  terreno: 'Terreno',
  kitnet: 'Apartamento',
}

const MIN_PRICE = 100_000
const MAX_PRICE = 5_000_000
const STEP = 50_000

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))
const parseCurrencyBRL = (s: string): number => {
  const digits = (s || '').replace(/[^\d]/g, '')
  return digits ? parseInt(digits, 10) : 0
}
const formatCurrencyBRL = (n: number): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n || 0)

function PropertySearch() {
  const router = useRouter()

  const [filters, setFilters] = useState<Filters>({
    tipo: '',
    cidade: '',
    bairro: '',
    priceRange: [500_000, 2_000_000],
  })
  const [propertyCode, setPropertyCode] = useState('')

  // inputs exibem BRL formatado enquanto o estado numérico permanece em priceRange
  const [minDisplay, setMinDisplay] = useState<string>(formatCurrencyBRL(filters.priceRange[0]))
  const [maxDisplay, setMaxDisplay] = useState<string>(formatCurrencyBRL(filters.priceRange[1]))

  const cidades = useCidades()
  const bairros = useBairros()

  useEffect(() => {
    setMinDisplay(formatCurrencyBRL(filters.priceRange[0]))
    setMaxDisplay(formatCurrencyBRL(filters.priceRange[1]))
  }, [filters.priceRange])

  const filteredBairros = useMemo(() => {
    const all = bairros.data || []
    if (!filters.cidade || filters.cidade === 'all') return []
    const cid = Number(filters.cidade)
    return all.filter((b) => b.cityId === cid)
  }, [bairros.data, filters.cidade])

  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handlePriceChange = (value: number[]) => {
    if (value.length === 2) {
      const [rawMin, rawMax] = value
      const min = clamp(rawMin, MIN_PRICE, MAX_PRICE)
      const max = clamp(rawMax, MIN_PRICE, MAX_PRICE)
      setFilters((prev) => ({ ...prev, priceRange: [min, max] }))
      setMinDisplay(formatCurrencyBRL(min))
      setMaxDisplay(formatCurrencyBRL(max))
    }
  }

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = parseCurrencyBRL(e.target.value)
    const min = clamp(raw, MIN_PRICE, filters.priceRange[1])
    setMinDisplay(formatCurrencyBRL(min))
    setFilters((p) => ({ ...p, priceRange: [min, p.priceRange[1]] }))
  }

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = parseCurrencyBRL(e.target.value)
    const max = clamp(raw, filters.priceRange[0], MAX_PRICE)
    setMaxDisplay(formatCurrencyBRL(max))
    setFilters((p) => ({ ...p, priceRange: [p.priceRange[0], max] }))
  }

  const searchByCode = () => {
    const code = propertyCode.trim()
    if (!code) return
    router.push(`/imoveis/${encodeURIComponent(code)}`)
  }

  const handleSearch = () => {
    const params = new URLSearchParams()
    const categoria = TYPE_TO_API[filters.tipo] || null
    if (categoria) params.set('categoria', categoria)
    if (filters.cidade && filters.cidade !== 'all') params.set('cidade_id', String(Number(filters.cidade)))
    if (filters.bairro && filters.bairro !== 'all') params.set('bai_id', String(Number(filters.bairro)))
    const [min, max] = filters.priceRange
    if (min) params.set('preco_min', String(min))
    if (max) params.set('preco_max', String(max))
    router.push(`/imoveis?${params.toString()}`)
  }

  const formatChip = (price: number) => formatCurrencyBRL(price)

  const activeFilters = useMemo(() => {
    const list: string[] = []
    if (filters.tipo && filters.tipo !== 'all') list.push(`tipo:${TYPE_UI.find((t) => t.value === filters.tipo)?.label ?? filters.tipo}`)
    if (filters.cidade && filters.cidade !== 'all') {
      const c = (cidades.data || []).find((x) => String(x.id) === filters.cidade)
      list.push(`cidade:${c?.name ?? filters.cidade}`)
    }
    if (filters.bairro && filters.bairro !== 'all') {
      const b = (bairros.data || []).find((x) => String(x.id) === filters.bairro)
      list.push(`bairro:${b?.name ?? filters.bairro}`)
    }
    const [min, max] = filters.priceRange
    if (min !== 500_000 || max !== 2_000_000) list.push(`priceRange:${formatChip(min)}-${formatChip(max)}`)
    return list
  }, [filters, cidades.data, bairros.data])

  const removeFilter = (f: string) => {
    const [key] = f.split(':')
    if (key === 'tipo' || key === 'cidade' || key === 'bairro') setFilters((p) => ({ ...p, [key]: '' }))
    else if (key === 'priceRange') setFilters((p) => ({ ...p, priceRange: [500_000, 2_000_000] }))
  }

  const clearFilters = () => {
    setFilters({ tipo: '', cidade: '', bairro: '', priceRange: [500_000, 2_000_000] })
  }

  return (
    <section className="w-full relative bg-[url(/images/bg-home.png)] min-h-screen pb-12 bg-cover bg-center flex flex-col items-center pt-20 md:pt-20 lg:pt-30">
      <div className="absolute inset-0 backdrop-blur-[2px] bg-black/30 z-0" />
      <div className="absolute inset-0 bg-[rgba(0,0,0,0.4)]" />
      <div className="container mx-auto px-4">
        <div className="relative z-10 text-white flex flex-col gap-6">
          <div className="w-full mx-auto md:w-3/4 lg:w-2/3 space-y-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[3.125rem] font-bold leading-[1.2] animate-fade-in">
              Conectando pessoas ao lar dos sonhos com paixão e propósito
            </h1>
            <h2 className="text-base md:text-[1.125rem] font-[400] leading-[1.2] opacity-90 animate-fade-in-delay">
              Do conforto acolhedor à localização prática, nossos imóveis oferecem espaços funcionais e atendimento dedicado para atender às suas necessidades.
            </h2>
          </div>

          <div className="w-full sm:w-11/12 md:w-4/6 mx-auto bg-card text-card-foreground rounded-xl shadow-2xl p-4 sm:p-6 md:p-8 backdrop-blur-sm animate-slide-up">
            <Tabs defaultValue="completa" className="w-full">
              <TabsList className="grid mx-auto grid-cols-2 mb-6 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
                <TabsTrigger value="completa" className="rounded-md font-semibold transition-all duration-300 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-700 data-[state=active]:shadow-sm">
                  Busca completa
                </TabsTrigger>
                <TabsTrigger value="codigo" className="rounded-md font-semibold transition-all duration-300 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-700 data-[state=active]:shadow-sm">
                  Busca por Código
                </TabsTrigger>
              </TabsList>

              <TabsContent value="completa" className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Tipo de Imóvel</label>
                      <Select value={filters.tipo} onValueChange={(v) => handleFilterChange('tipo', v === 'all' ? '' : v)}>
                        <SelectTrigger className="w-full h-12 border-2 hover:border-accent-deep-blue dark:hover:border-accent-deep-blue focus:border-accent-deep-blue transition-all duration-200">
                          <div className="flex items-center">
                            <House className="h-4 w-4 text-accent-deep-blue mr-2 flex-shrink-0" />
                            <SelectValue placeholder="Tipo de Imóvel" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {TYPE_UI.map((t) => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Cidade</label>
                      <Select value={filters.cidade} onValueChange={(v) => handleFilterChange('cidade', v)}>
                        <SelectTrigger className="w-full h-12 border-2 border-neutral-200 dark:border-neutral-600 hover:border-accent-deep-blue dark:hover:border-accent-deep-blue focus:border-accent-deep-blue transition-all duration-200">
                          <div className="flex items-center">
                            <Building2 className="h-4 w-4 text-accent-deep-blue mr-2 flex-shrink-0" />
                            <SelectValue placeholder="Cidade" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas</SelectItem>
                          {(cidades.data || []).map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                      <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Bairro</label>
                      <Select
                        value={filters.bairro}
                        onValueChange={(v) => handleFilterChange('bairro', v)}
                        disabled={!filters.cidade || filters.cidade === 'all'}
                      >
                        <SelectTrigger className="w-full h-12 border-2 border-neutral-200 dark:border-neutral-600 hover:border-accent-deep-blue dark:hover:border-accent-deep-blue focus:border-accent-deep-blue transition-all duration-200">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 text-accent-deep-blue mr-2 flex-shrink-0" />
                            <SelectValue placeholder="Bairro" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          {filteredBairros.map((b) => (
                            <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="lg:hidden">
                    <Button
                      onClick={handleSearch}
                      className="w-full h-12 text-black bg-accent hover:bg-accent-yellow-hover dark:hover:bg-accent-yellow-selection font-bold text-sm transition-all duration-200 transform hover:scale-[1.02]"
                    >
                      <Search className="mr-2 h-4 w-4" />
                      Buscar
                    </Button>
                  </div>
                </div>

                <div className="space-y-6 p-6 bg-neutral-800/40 dark:from-black-900/20 rounded-xl border border-blue-100 dark:border-yellow-300/30">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Faixa de Preço</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 px-2 py-1 rounded-md shadow-sm">
                        Min: {formatCurrencyBRL(filters.priceRange[0])}
                      </span>
                      <span className="text-xs text-neutral-400">-</span>
                      <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 px-2 py-1 rounded-md shadow-sm">
                        Max: {formatCurrencyBRL(filters.priceRange[1])}
                      </span>
                    </div>
                  </div>

                  <div className="px-3 py-4">
                    <DualSlider
                      value={filters.priceRange}
                      onValueChange={handlePriceChange}
                      min={MIN_PRICE}
                      max={MAX_PRICE}
                      step={STEP}
                      className="w-full"
                    />
                  </div>

                  <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400 px-3">
                    <span className="font-medium">{formatCurrencyBRL(MIN_PRICE)}</span>
                    <span className="font-medium">{formatCurrencyBRL(MAX_PRICE)}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Preço Mínimo</label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={minDisplay}
                        onChange={handleMinPriceChange}
                        className="h-10 text-sm border-neutral-200 dark:border-neutral-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Preço Máximo</label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={maxDisplay}
                        onChange={handleMaxPriceChange}
                        className="h-10 text-sm border-neutral-200 dark:border-neutral-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="hidden lg:block">
                  <Button
                    onClick={handleSearch}
                    className="w-full h-14 text-black bg-accent-yellow hover:bg-accent-yellow-hover dark:hover:bg-accent-yellow-selection font-bold text-base transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                  >
                    <Search className="mr-2 h-5 w-5" />
                    Buscar Imóveis
                  </Button>
                </div>

                {activeFilters.length > 0 && (
                  <div className="space-y-3 pt-2 border-t border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Filtros Ativos</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 text-xs h-8 px-3"
                      >
                        Limpar Filtros
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {activeFilters.map((f) => {
                        const [name, value] = f.split(':')
                        const display =
                          name === 'tipo' ? 'Tipo' :
                          name === 'cidade' ? 'Cidade' :
                          name === 'bairro' ? 'Bairro' :
                          name === 'priceRange' ? 'Preço' : name
                        return (
                          <Badge
                            key={f}
                            variant="secondary"
                            className="flex items-center gap-2 rounded-full text-xs py-1 px-3 bg-yellow-500/40 dark:bg-yellow-600/40 text-black dark:hover:text-black hover:font-semibold dark:text-white hover:bg-yellow-600 dark:hover:bg-yellow-500 transition-colors duration-200"
                          >
                            <span>
                              {display}: {value}
                            </span>
                            <button
                              className="hover:bg-black/40 dark:hover:bg-white/60 rounded-full p-0.5"
                              onClick={(e) => {
                                e.stopPropagation()
                                removeFilter(f)
                              }}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="codigo" className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Código do Imóvel</label>
                    <Input
                      placeholder="Digite o código do imóvel (ex: VG001)"
                      value={propertyCode}
                      onChange={(e) => setPropertyCode(e.target.value)}
                      className="w-full h-12 text-base font-semibold border-2 border-neutral-200 dark:border-neutral-600 hover:border-accent-deep-blue dark:hover:border-accent-deep-blue focus:border-accent-deep-blue"
                    />
                  </div>
                  <Button
                    className="w-full h-12 text-black bg-accent-yellow hover:bg-accent-yellow-hover dark:hover:bg-accent-yellow-selection font-bold text-base transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                    onClick={searchByCode}
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Buscar por Código
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </section>
  )
}

export { PropertySearch as default }
