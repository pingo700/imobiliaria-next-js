import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { PropertyFormDataSchema } from '../../schemas/property'
import type { PropertyFormData, Property } from '../../schemas/property'
import type { Owner } from '../../schemas/owner'
import type { Estado, Cidade, Bairro } from '../../schemas/location'
import { useEstados, useCidades, useBairros } from '../../hooks/queries/useLocations'
import { useProperty } from '../../hooks/queries/useProperties'
import { useOwners, useOwnerSearch } from '../../hooks/queries/useOwners'
import { useCep } from '../../hooks/queries/useCEP'
import { useCreateProperty, useUpdateProperty } from '../../hooks/mutations/usePropertyMutations'
import { propertiesService } from '../../services/properties.service'
import { queryKeys } from '../../keys'

type FieldName = keyof PropertyFormData

export type UsePropertyFormOptions = {
  mode?: 'create' | 'edit'
  propertyId?: number
  onSuccess?: (resp: unknown) => void
  onError?: (err: Error) => void
}

export type UsePropertyFormReturn = {
  values: PropertyFormData
  setField: (name: FieldName, value: any) => void
  setMany: (patch: Partial<PropertyFormData>) => void
  errors: Partial<Record<FieldName, string>>
  isValid: boolean
  isDirty: boolean
  reset: () => void
  files: File[]
  addFiles: (files: File[]) => void
  removeFile: (index: number) => void
  clearFiles: () => void
  previews: string[]
  owners: { data: Owner[]; isLoading: boolean }
  ownerQuery: string
  setOwnerQuery: (q: string) => void
  estados: { data: Estado[]; isLoading: boolean }
  cidades: { data: Cidade[]; isLoading: boolean }
  bairros: { data: Bairro[]; isLoading: boolean }
  cidadesFiltradas: Cidade[]
  bairrosFiltrados: Bairro[]
  cep: {
    search: (cep: string) => void
    format: (cep: string) => string
    validateFormat: (cep: string) => boolean
    isFetching: boolean
  }
  submit: {
    create: () => Promise<void>
    update: (id: number) => Promise<void>
    isSubmitting: boolean
    error: Error | null
  }
}

const INITIAL_VALUES: PropertyFormData = {
  title: '',
  type: 'Casa',
  price: '',
  address: '',
  zipCode: '',
  imo_condominio: '',
  imo_latitude: undefined,
  imo_longitude: undefined,
  estado_nome: '',
  cidade_nome: '',
  bairro_nome: '',
  bedrooms: '',
  bathrooms: '',
  suites: '',
  laundries: '',
  escritorios: '',
  parking: '',
  area: '',
  totalArea: '',
  description: '',
  imd_status: 'À venda',
  features: [],
  prp_id: undefined,
  closets: '',
  kitchens: '',
  lavabos: '',
  estar: '',
  jantar: '',
}

const lc = (s?: string) => (s ?? '').toLowerCase()

function normalizePriceDigits(input: unknown): string {
  if (input === null || input === undefined || input === '') return ''
  if (typeof input === 'number') return String(Math.round(input * 100))
  const s = String(input).trim()
  if (!s) return ''
  const hasSep = /[.,]/.test(s)
  if (!hasSep) {
    const d = s.replace(/\D/g, '')
    if (!d) return ''
    return String(Number(d) * 100)
  }
  const cleaned = s.replace(/[^0-9.,]/g, '')
  const parts = cleaned.split(/[.,]/)
  const decRaw = (parts.pop() || '').replace(/\D/g, '')
  const intRaw = parts.join('').replace(/\D/g, '')
  const dec = (decRaw || '').padEnd(2, '0').slice(0, 2)
  const intDigits = intRaw || '0'
  return `${intDigits}${dec}`
}

function mapPropertyToForm(p: any): PropertyFormData {
  const or = (...vals: any[]) => vals.find(v => v !== undefined && v !== null && v !== '') ?? ''

  const priceRaw = or(p?.price, p?.imo_valor, p?.value)
  const toDigits = (v: any): string => {
    if (v === '' || v == null) return ''
    if (typeof v === 'number') return String(Math.round(v * 100))
    const s = String(v).trim()
    if (!s) return ''
    const onlyDigits = s.replace(/\D/g, '')
    if (!onlyDigits) return ''
    return onlyDigits.length > 5 ? onlyDigits : String(Number(onlyDigits) * 100)
  }

  const d = p?.details ?? p?.descricao ?? {}
  const coordLat = or(p?.coordinates?.lat, p?.imo_latitude)
  const coordLng = or(p?.coordinates?.lng, p?.imo_longitude)

  return {
    title: or(p?.title, p?.name, p?.imo_nome),
    type: or(p?.type, p?.category, p?.imo_categoria, 'Casa'),
    price: toDigits(priceRaw),
    address: or(p?.address, p?.imo_endereco),
    zipCode: String(or(p?.zipCode, p?.imo_cep)).replace(/\D/g, ''),
    imo_condominio: or(p?.condominium, p?.imo_condominio),
    imo_latitude: coordLat === '' ? undefined : coordLat,
    imo_longitude: coordLng === '' ? undefined : coordLng,
    estado_nome: or(p?.location?.state, p?.estado_nome),
    cidade_nome: or(p?.location?.city, p?.cidade_nome),
    bairro_nome: or(p?.location?.neighborhood, p?.bairro_nome),

    bedrooms: String(or(d?.bedrooms, d?.imd_quartos)),
    bathrooms: String(or(d?.bathrooms, d?.imd_banheiros)),
    suites: String(or(d?.suites, d?.imd_suites)),
    laundries: String(or(d?.laundries, d?.imd_lavanderias)),
    escritorios: String(or(d?.escritorios, d?.imd_escritorios)),
    parking: String(or(d?.parking, d?.imd_vagas)),
    area: String(or(d?.usableArea, d?.imd_area_util)),
    totalArea: String(or(d?.totalArea, d?.imd_area_total)),
    description: or(d?.description, d?.imd_descricao),
    imd_status: or(d?.status, d?.imd_status, 'À venda'),
    features: Array.isArray(p?.features) ? p.features : (p?.caracteristicas ?? []),

    prp_id: p?.ownerId ?? undefined,
    closets: String(or(d?.closets, d?.imd_closets)),
    kitchens: String(or(d?.kitchens, d?.imd_cozinhas)),
    lavabos: String(or(d?.lavabos, d?.imd_lavabos)),
    estar: String(or(d?.estar, d?.imd_sala_estar)),
    jantar: String(or(d?.jantar, d?.imd_sala_jantar)),
  }
}

export function usePropertyForm(options: UsePropertyFormOptions = {}): UsePropertyFormReturn {
  const { mode = 'create', propertyId, onSuccess, onError } = options
  const queryClient = useQueryClient()
  const [values, setValues] = useState<PropertyFormData>(INITIAL_VALUES)
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({})
  const [isDirty, setIsDirty] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [ownerQuery, setOwnerQuery] = useState('')
  const deferredOwnerQuery = useDeferredValue(ownerQuery)
  const [_, startTransition] = useTransition()

  const estadosQuery = useEstados()
  const cidadesQuery = useCidades()
  const bairrosQuery = useBairros()

  const ownersQuery = useOwners()
  const remoteOwnerSearch = useOwnerSearch(
    deferredOwnerQuery,
    deferredOwnerQuery.length >= 2 && (ownersQuery.data?.length ?? 0) > 200
  )

  const propertyQuery = useProperty(propertyId, { enabled: mode === 'edit' && !!propertyId })

  const createMutation = useCreateProperty()
  const updateMutation = useUpdateProperty()
  const isSubmitting = createMutation.isPending || updateMutation.isPending
  const submitError = (createMutation.error as Error) || (updateMutation.error as Error) || null

  const hydratedRef = useRef(false)
  const ownerHydratedRef = useRef(false)

  useEffect(() => {
    hydratedRef.current = false
    ownerHydratedRef.current = false
  }, [propertyId])

  useEffect(() => {
    if (mode !== 'edit') return
    const p = propertyQuery.data
    if (!p) return
    if (hydratedRef.current) return
    setValues(mapPropertyToForm(p))
    setIsDirty(false)
    hydratedRef.current = true
  }, [mode, propertyQuery.data])

  useEffect(() => {
    if (mode !== 'edit') return
    const p: any = propertyQuery.data
    if (!p) return

    const nameFromApi = (p.ownerName ?? p.prp_nome ?? '').trim()
    setOwnerQuery(prev => prev || nameFromApi)

    if (ownerHydratedRef.current) return
    const list = ownersQuery.data
    if (!list || list.length === 0) return

    if (!nameFromApi) { 
      ownerHydratedRef.current = true
      return
    }

    const norm = (s: string) => s.trim().toLowerCase()
    const match = list.find(o => norm(o.name) === norm(nameFromApi))
    if (match) setValues(v => ({ ...v, prp_id: match.id }))

    ownerHydratedRef.current = true
  }, [mode, propertyQuery.data, ownersQuery.data, setValues])

  useEffect(() => {
    if (mode === 'edit' && propertyQuery.data && files.length === 0) {
      const existing = propertyQuery.data.images ?? []
      if (existing.length) setPreviews(existing)
    }
  }, [mode, propertyQuery.data, files.length])

  useEffect(() => {
    if (mode !== 'edit') return
    const p = propertyQuery.data
    if (!p) return
    if (values.estado_nome && values.cidade_nome && values.bairro_nome) return
    if (!p.neighborhoodId) return
    const b = (bairrosQuery.data || []).find(x => x.id === p.neighborhoodId)
    if (!b) return
    setValues(v => ({
      ...v,
      bairro_nome: v.bairro_nome || b.name,
      cidade_nome: v.cidade_nome || b.cityName || '',
      estado_nome: v.estado_nome || b.stateName || '',
    }))
  }, [mode, propertyQuery.data, bairrosQuery.data, values.estado_nome, values.cidade_nome, values.bairro_nome])
  useEffect(() => {
    if (ownersQuery.isSuccess) {
      console.log('[owners] count:', ownersQuery.data?.length, ownersQuery.data?.slice(0,3))
    }
    if (ownersQuery.isError) {
      console.error('[owners] error:', ownersQuery.error)
    }
  }, [ownersQuery.isSuccess, ownersQuery.isError, ownersQuery.data])
  useEffect(() => {
    if (mode !== 'edit') return
    console.table({
      id: propertyId,
      enabled: mode === 'edit' && !!propertyId,
      status: propertyQuery.status,
      fetchStatus: propertyQuery.fetchStatus,
      hasData: !!propertyQuery.data,
    })
    if (propertyQuery.data) {
      // Mostra as chaves do objeto que o schema te entregou
      console.log('[usePropertyForm] keys:', Object.keys(propertyQuery.data as any))
      console.log('[usePropertyForm] sample:', propertyQuery.data)
    }
    if (propertyQuery.isError) {
      console.error('[useProperty] error:', propertyQuery.error)
    }
  }, [mode, propertyId, propertyQuery.status, propertyQuery.fetchStatus, propertyQuery.data, propertyQuery.isError, propertyQuery.error])

  const validation = useMemo(() => {
    const parsed = PropertyFormDataSchema.safeParse(values)
    if (parsed.success) return { ok: true as const }
    const f = parsed.error.flatten().fieldErrors
    const mapped: Partial<Record<FieldName, string>> = {}
    Object.entries(f).forEach(([k, arr]) => {
      if (arr && arr.length) mapped[k as FieldName] = arr[0]
    })
    return { ok: false as const, errors: mapped }
  }, [values])

  const setField = useCallback((name: FieldName, value: any) => {
    setValues(v => ({ ...v, [name]: value }))
    setIsDirty(true)
  }, [])

  const setMany = useCallback((patch: Partial<PropertyFormData>) => {
    setValues(v => ({ ...v, ...patch }))
    setIsDirty(true)
  }, [])

  const reset = useCallback(() => {
    setValues(INITIAL_VALUES)
    setErrors({})
    setFiles([])
    setPreviews([])
    setIsDirty(false)
    setOwnerQuery('')
  }, [])

  const addFiles = useCallback((incoming: File[]) => {
    const valid = incoming.filter(f => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024)
    if (valid.length === 0) return
    setFiles(prev => [...prev, ...valid])
    setIsDirty(true)
  }, [])

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
    setIsDirty(true)
  }, [])

  const clearFiles = useCallback(() => {
    setFiles([])
    setIsDirty(true)
  }, [])

  useEffect(() => {
    const urls = files.map(f => URL.createObjectURL(f))
    setPreviews(urls)
    return () => {
      urls.forEach(u => URL.revokeObjectURL(u))
    }
  }, [files])

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty && !isSubmitting) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty, isSubmitting])

  const cidadesFiltradas = useMemo(() => {
    const all = cidadesQuery.data || []
    const estado = lc(values.estado_nome)
    if (!estado) return all
    return all.filter(c => lc(c.stateName) === estado)
  }, [cidadesQuery.data, values.estado_nome])

  const bairrosFiltrados = useMemo(() => {
    const all = bairrosQuery.data || []
    const cidade = lc(values.cidade_nome)
    if (!cidade) return all
    return all.filter(b => lc(b.cityName) === cidade)
  }, [bairrosQuery.data, values.cidade_nome])

  const ownersFiltered: Owner[] = useMemo(() => {
    // se a busca remota trouxe algo, priorize-a
    if (remoteOwnerSearch.data && remoteOwnerSearch.data.length) return remoteOwnerSearch.data

    const base = ownersQuery.data || []
    const q = (deferredOwnerQuery || '').trim()
    if (!q) return base

    const norm = (s?: string | null) =>
      (s ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()

    const dig = (s?: string | null) => (s ?? '').replace(/\D/g, '')

    const qNorm = norm(q)
    const qDig = dig(q)

    const filtered = base.filter(o => {
      const name = norm(o.name)
      const doc = dig(o.document)
      const phone = dig(o.phone)
      return (
        (qNorm && name.includes(qNorm)) ||
        (qDig && (doc.includes(qDig) || phone.includes(qDig) || String(o.id).includes(qDig)))
      )
    })

    // se por algum motivo ficou vazio (ex.: acento/variação), volte à lista base
    return filtered.length ? filtered : base
  }, [ownersQuery.data, remoteOwnerSearch.data, deferredOwnerQuery])

  const cepQuery = useCep()
  const lastCepAppliedRef = useRef<string | null>(null)
  useEffect(() => {
    if (ownersQuery.isSuccess) {
      console.log('[owners] base:', ownersQuery.data.length)
    }
  }, [ownersQuery.isSuccess, ownersQuery.data])

  useEffect(() => {
    console.log('[ownersFiltered] q=', deferredOwnerQuery, 'len=', ownersFiltered.length)
  }, [deferredOwnerQuery, ownersFiltered])
  const searchCep = useCallback(
    (raw: string) => {
      const onlyDigits = raw.replace(/\D/g, '')
      if (onlyDigits.length !== 8) return
      cepQuery.searchCep(onlyDigits)
    },
    [cepQuery]
  )

  useEffect(() => {
    const d = cepQuery.data
    if (!d) return
    if (lastCepAppliedRef.current === d.cep) return

    startTransition(() => {
      setMany({
        zipCode: d.cep || values.zipCode,
        address: d.logradouro || values.address,
        imo_latitude: d.latitude ?? values.imo_latitude,
        imo_longitude: d.longitude ?? values.imo_longitude,
      })
    })

    if (!d.estado || !d.estado.trim()) {
      toast.info('Estado não localizado na API ViaCEP, por favor insira o estado manualmente!', {
        description: 'Preencha manualmente Estado, Cidade e Bairro se necessário.',
      })
      lastCepAppliedRef.current = d.cep
      return
    }

    const estados = estadosQuery.data || []
    const cidades = cidadesQuery.data || []
    const bairros = bairrosQuery.data || []

    const stateFull = d.estado.trim()
    const cityName = d.localidade || ''
    const bairroName = d.bairro || ''

    const est = estados.find(e => lc(e.name) === lc(stateFull))
    const cid = est ? cidades.find(c => lc(c.name) === lc(cityName) && (!c.stateName || lc(c.stateName) === lc(stateFull))) : undefined
    const bai = cid ? bairros.find(b => lc(b.name) === lc(bairroName) && (!b.cityName || lc(b.cityName) === lc(cityName))) : undefined

    if (est && cid && bai) {
      startTransition(() => {
        setMany({ estado_nome: est.name, cidade_nome: cid.name, bairro_nome: bai.name })
      })
    } else {
      const missing: string[] = []
      if (!est) missing.push(`estado "${stateFull}"`)
      if (est && !cid) missing.push(`cidade "${cityName}"`)
      if (cid && !bai) missing.push(`bairro "${bairroName}"`)
      if (missing.length) {
        toast.info('Dados do CEP não estão cadastrados no sistema.', {
          description: `Cadastre ${missing.join(', ')} para preenchimento automático.`,
        })
      }
    }

    lastCepAppliedRef.current = d.cep
  }, [
    cepQuery.data,
    estadosQuery.data,
    cidadesQuery.data,
    bairrosQuery.data,
    setMany,
    startTransition,
    values.address,
    values.imo_latitude,
    values.imo_longitude,
    values.zipCode,
  ])

  const doCreate = useCallback(async () => {
    const parsed = PropertyFormDataSchema.safeParse(values)
    if (!parsed.success) {
      const f = parsed.error.flatten().fieldErrors
      const mapped: Partial<Record<FieldName, string>> = {}
      Object.entries(f).forEach(([k, arr]) => {
        if (arr && arr.length) mapped[k as FieldName] = arr[0]
      })
      setErrors(mapped)
      onError?.(new Error('Formulário inválido'))
      return
    }
    setErrors({})
    const fd = propertiesService.createFormData(values, files)
    try {
      await createMutation.mutateAsync(fd)
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.all() })
      setIsDirty(false)
      onSuccess?.(true)
    } catch (e) {
      onError?.(e as Error)
    }
  }, [values, files, createMutation, queryClient, onSuccess, onError])

  const doUpdate = useCallback(async (id: number) => {
    const parsed = PropertyFormDataSchema.safeParse(values)
    if (!parsed.success) {
      const f = parsed.error.flatten().fieldErrors
      const mapped: Partial<Record<FieldName, string>> = {}
      Object.entries(f).forEach(([k, arr]) => {
        if (arr && arr.length) mapped[k as FieldName] = arr[0]
      })
      setErrors(mapped)
      onError?.(new Error('Formulário inválido'))
      return
    }
    setErrors({})
    const fd = propertiesService.createFormData(values, files)
    try {
      await updateMutation.mutateAsync({ id, formData: fd })
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.all() })
      setIsDirty(false)
      onSuccess?.(true)
    } catch (e) {
      onError?.(e as Error)
    }
  }, [values, files, updateMutation, queryClient, onSuccess, onError])

  return {
    values,
    setField,
    setMany,
    errors,
    isValid: validation.ok,
    isDirty,
    reset,
    files,
    addFiles,
    removeFile,
    clearFiles,
    previews,
    owners: { data: ownersFiltered, isLoading: ownersQuery.isLoading || remoteOwnerSearch.isLoading },
    ownerQuery,
    setOwnerQuery,
    estados: { data: estadosQuery.data || [], isLoading: estadosQuery.isLoading },
    cidades: { data: cidadesQuery.data || [], isLoading: cidadesQuery.isLoading },
    bairros: { data: bairrosQuery.data || [], isLoading: bairrosQuery.isLoading },
    cidadesFiltradas,
    bairrosFiltrados,
    cep: {
      search: searchCep,
      format: cepQuery.formatCep,
      validateFormat: cepQuery.validateFormat,
      isFetching: cepQuery.isFetching,
    },
    submit: {
      create: doCreate,
      update: doUpdate,
      isSubmitting,
      error: submitError,
    },
  }
}
