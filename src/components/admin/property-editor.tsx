'use client'

import React, { memo, useCallback, useMemo, useDeferredValue, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { usePropertyForm } from '@/api/hooks/forms/usePropertyForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { SearchComboBox } from '@/components/ui/search-combo-box'
import { CrudHeader } from '@/components/admin/crud'
import {
  Home,
  DollarSign,
  Check,
  AlertCircle,
  User,
  MapPin,
  Loader2,
  Upload,
  X,
  ImageIcon,
  Ruler,
  Plus,
  Tag,
} from 'lucide-react'

type PropertyEditorProps = {
  mode: 'create' | 'edit'
  propertyId?: number
  onSuccess?: () => void
}

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const digitsOnly = (s: string) => s.replace(/\D/g, '')
const formatBRLFromDigits = (digits: string) => (digits ? BRL.format(Number(digits) / 100) : '')
const PROPERTY_TYPES = ['Casa', 'Apartamento', 'Terreno', 'Comercial'] as const
const PROPERTY_STATUS_OPTIONS = [
  { value: 'À venda', label: 'À venda' },
  { value: 'Aluguel', label: 'Para alugar' },
  { value: 'Vendido', label: 'Vendido' },
  { value: 'Alugado', label: 'Alugado' },
  { value: 'Lançamento', label: 'Lançamento' },
] as const
const SUGGESTED_TAGS = [
  'Piscina',
  'Quadra',
  'Churrasqueiras',
  'Salão de festas',
  'Playground',
  'Mercado digital',
  'Portaria 24 horas'
] as const

const numberInputClass =
  'border input h-9 rounded-md px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'

type NumberFieldProps = {
  label: string
  value: string | number | undefined
  onCommit: (v: string) => void
  disabled?: boolean
  placeholder?: string
}

function shallowEqualPick<A extends Record<string, any>, K extends keyof A>(a: A, b: A, keys: readonly K[]) {
  for (const k of keys) if (a?.[k] !== b?.[k]) return false
  return true
}

function TextFieldBind({
  id,
  value,
  disabled,
  placeholder,
  onCommit,
  className,
}: {
  id?: string
  value: string | undefined
  disabled?: boolean
  placeholder?: string
  onCommit: (v: string) => void
  className?: string
}) {
  const [local, setLocal] = React.useState(value ?? '')
  React.useEffect(() => setLocal(value ?? ''), [value])
  return (
    <Input
      id={id}
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => onCommit(local)}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
    />
  )
}

function TextareaBind({
  id,
  value,
  disabled,
  placeholder,
  onCommit,
}: {
  id?: string
  value: string | undefined
  disabled?: boolean
  placeholder?: string
  onCommit: (v: string) => void
}) {
  const [local, setLocal] = React.useState(value ?? '')
  React.useEffect(() => setLocal(value ?? ''), [value])
  return (
    <Textarea
      id={id}
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => onCommit(local)}
      placeholder={placeholder}
      disabled={disabled}
    />
  )
}

function NumberField({ label, value, onCommit, disabled, placeholder = '0' }: NumberFieldProps) {
  const id = React.useId()
  const [local, setLocal] = React.useState(String(value ?? ''))
  React.useEffect(() => setLocal(String(value ?? '')), [value])
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        className={numberInputClass}
        placeholder={placeholder}
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => onCommit(local)}
        disabled={disabled}
      />
    </div>
  )
}

function BRLInput({
  id,
  valueDigits,
  disabled,
  className,
  onCommit,
}: {
  id?: string
  valueDigits?: string
  disabled?: boolean
  className?: string
  onCommit: (digits: string) => void
}) {
  const [digits, setDigits] = React.useState(valueDigits ?? '')
  React.useEffect(() => setDigits(valueDigits ?? ''), [valueDigits])
  const view = digits ? BRL.format(Number(digits) / 100) : ''
  return (
    <Input
      id={id}
      inputMode="numeric"
      className={className}
      placeholder="Ex.: 350.000,00"
      value={view}
      onChange={(e) => setDigits(digitsOnly(e.target.value))}
      onBlur={() => onCommit(digits)}
      disabled={disabled}
    />
  )
}

export default function PropertyEditor({ mode, propertyId, onSuccess }: PropertyEditorProps) {
  const router = useRouter()
  const sp = useSearchParams()
  const debug = sp.get('debug') === '1'
  const [_, startTransition] = useTransition()

  const handleSuccess = useCallback(() => {
    if (onSuccess) onSuccess()
    else router.push('/admin/imoveis')
  }, [onSuccess, router])

  const form = usePropertyForm({
    mode,
    propertyId: Number(propertyId), // Garanta que é número
    onSuccess: handleSuccess,
    onError: (e) => {
      console.error('[usePropertyForm] submit error', e)
    },
  })

  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[PropertyEditor] mode', mode, 'propertyId', propertyId)
    }
  }, [mode, propertyId])

  const [raw, setRaw] = React.useState<any>(null)
  React.useEffect(() => {
    if (!debug || mode !== 'edit' || !propertyId) return
    fetch(`/api/admin/detalhes/imovel/${propertyId}`, { credentials: 'include' })
      .then(r => r.json().catch(() => null))
      .then(d => {
        setRaw(d)
        if (process.env.NODE_ENV !== 'production') {
          console.log('[PropertyEditor] raw property payload', d)
        }
      })
      .catch(e => {
        setRaw({ __error: String(e) })
        if (process.env.NODE_ENV !== 'production') {
          console.error('[PropertyEditor] raw fetch error', e)
        }
      })
  }, [debug, mode, propertyId])

  const isSubmitting = form.submit.isSubmitting
  const handleSubmit = useCallback(() => {
    if (mode === 'edit') {
      if (propertyId) form.submit.update(propertyId)
    } else {
      form.submit.create()
    }
  }, [mode, propertyId, form.submit])

  const savingLabel = mode === 'edit' ? 'Atualizando imóvel...' : 'Salvando imóvel...'
  const headerTitle = mode === 'edit' ? 'Editar Imóvel' : 'Criar Imóvel'
  const headerSubtitle =
    mode === 'edit'
      ? 'Altere as informações e salve as mudanças'
      : 'Preencha as informações para cadastrar um novo imóvel'

  const deferredValues = useDeferredValue(form.values)

  const cepProps = useMemo(
    () => ({
      value: form.values.zipCode || '',
      format: form.cep.format,
      validate: form.cep.validateFormat,
      search: form.cep.search,
      isFetching: form.cep.isFetching,
    }),
    [form.values.zipCode, form.cep.format, form.cep.validateFormat, form.cep.search, form.cep.isFetching]
  )

  const debugValues = React.useMemo(() => (debug ? JSON.stringify(form.values) : ''), [debug, form.values])
  const debugErrors = React.useMemo(() => (debug ? JSON.stringify(form.errors) : ''), [debug, form.errors])
  const debugRaw = React.useMemo(() => (debug ? (raw ? JSON.stringify(raw).slice(0, 2000) : 'null') : ''), [debug, raw])

  return (
    <div className="min-h-screen">
      <div className="py-4 md:py-6 max-w-6xl mx-auto">
        <div className="mb-4">
          <CrudHeader title={headerTitle} subtitle={headerSubtitle} />
        </div>

        {debug && (
          <Card className="mb-6 border-2 border-yellow-400">
            <CardHeader>
              <CardTitle>Debug</CardTitle>
              <CardDescription>Adicione ?debug=1 na URL para ocultar/mostrar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xs">mode: {mode} | propertyId: {String(propertyId ?? '')}</div>
              <div className="text-xs">isSubmitting: {String(isSubmitting)} | isValid: {String(form.isValid)}</div>
              <div className="text-xs">errors: {debugErrors}</div>
              <div className="text-xs">values: {debugValues}</div>
              <div className="text-xs">raw: {debugRaw}</div>
            </CardContent>
          </Card>
        )}

        {isSubmitting && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium mb-2">{savingLabel}</p>
                  <Progress value={70} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          <div className="space-y-6">
            <BasicInfoSection
              values={form.values}
              errors={form.errors}
              isPending={isSubmitting}
              ownerQuery={form.ownerQuery}
              owners={form.owners.data}
              ownersLoading={form.owners.isLoading}
              onOwnerQueryChange={(v) => startTransition(() => form.setOwnerQuery(v))}
              onOwnerSelect={(ownerId) => form.setField('prp_id', ownerId)}
              onFieldCommit={form.setField}
            />

            <LocationSection
              values={form.values}
              errors={form.errors}
              isPending={isSubmitting}
              estados={form.estados.data}
              cidades={form.cidadesFiltradas}
              bairros={form.bairrosFiltrados}
              cep={cepProps}
              onFieldCommit={form.setField}
              onMany={(patch) => startTransition(() => form.setMany(patch))}
            />

            <DetailsSection
              values={form.values}
              errors={form.errors}
              isPending={isSubmitting}
              onFieldCommit={form.setField}
            />

            <MediaSection
              images={form.previews}
              onAddImages={form.addFiles}
              onRemoveImage={form.removeFile}
              isPending={isSubmitting}
            />
          </div>

          <div className="sticky top-6 space-y-6">
            <Card className="sticky top-6 shadow-md">
              <CardContent>
                <PreviewVisual values={deferredValues} images={form.previews} />
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button
                  type="button"
                  size="lg"
                  className="w-full text-md"
                  disabled={isSubmitting || !form.isValid || (mode === 'edit' && !propertyId)}
                  onClick={handleSubmit}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {savingLabel}
                    </>
                  ) : (
                    (mode === 'edit' ? 'Salvar alterações' : 'Criar imóvel')
                  )}
                </Button>
                <Button variant="outline" type="button" className="w-full" disabled={isSubmitting} onClick={() => router.push('/admin/imoveis')}>
                  Cancelar
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

type BasicInfoProps = {
  values: ReturnType<typeof usePropertyForm>['values']
  errors: ReturnType<typeof usePropertyForm>['errors']
  isPending: boolean
  ownerQuery: string
  owners: Array<{ id: number; name: string; document: string | null; phone: string }>
  ownersLoading: boolean
  onOwnerQueryChange: (v: string) => void
  onOwnerSelect: (ownerId: number) => void
  onFieldCommit: (name: any, value: any) => void
}

const formatDocument = (doc?: string | null) =>
  doc ? doc.replace(/\D/g, '').replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4') : ''
const formatPhone = (p?: string | null) =>
  p ? p.replace(/\D/g, '').replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3') : ''

const BasicInfoSection = memo(function BasicInfoSection({
  values,
  errors,
  isPending,
  ownerQuery,
  owners,
  ownersLoading,
  onOwnerQueryChange,
  onOwnerSelect,
  onFieldCommit,
}: BasicInfoProps) {
  const [_, startTransition] = useTransition()
  const ownerById = useMemo(() => new Map(owners.map(o => [o.id, o])), [owners])

  const handleOwnerSelect = useCallback(
    (ownerId: number) => {
      const owner = ownerById.get(ownerId)
      onOwnerSelect(ownerId)
      startTransition(() => onOwnerQueryChange(owner ? owner.name : ''))
    },
    [ownerById, onOwnerSelect, onOwnerQueryChange, startTransition]
  )

  const [tagInput, setTagInput] = React.useState('')

  const addTag = useCallback((t: string) => {
    const tag = t.trim()
    if (!tag) return
    if ((values.features ?? []).some((x) => x.toLowerCase() === tag.toLowerCase())) return
    onFieldCommit('features', [...(values.features ?? []), tag])
    setTagInput('')
  }, [values.features, onFieldCommit])

  const removeTag = useCallback((t: string) => {
    onFieldCommit('features', (values.features ?? []).filter((x) => x !== t))
  }, [values.features, onFieldCommit])

  const onTagKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag(tagInput)
    }
  }, [tagInput, addTag])

  const ownerOptions = React.useMemo(() => {
    const strip = (s?: string | null) => (s ?? "").trim()
    const justDigits = (s?: string | null) => strip(s).replace(/\D/g, "")
    return owners.map(o => {
      const name = o.name || `Proprietário ${o.id}`
      const docFmt = formatDocument(o.document)
      const docDig = justDigits(o.document)
      const phoneFmt = formatPhone(o.phone)
      const phoneDig = justDigits(o.phone)
      return {
        value: String(o.id),
        label: name,
        icon: User,
        keywords: [docFmt, docDig, phoneFmt, phoneDig, String(o.id)],
        content: (
          <div>
            <div className="font-medium">{name}</div>
            <div className="text-xs text-muted-foreground">
              {[docFmt, phoneFmt].filter(Boolean).join(" • ")}
            </div>
          </div>
        ),
      }
    })
  }, [owners])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="w-5 h-5" />
          Informações Básicas
        </CardTitle>
        <CardDescription>Preencha os dados principais do imóvel</CardDescription>
      </CardHeader>
      <CardContent className="space-y-7.5">
        <div className="space-y-2">
          <Label htmlFor="title" className="flex items-center gap-2">
            Título do Imóvel <span className="text-red-500">*</span>
            {values.title && !errors.title && <Check className="w-4 h-4 text-green-500" />}
          </Label>
          <TextFieldBind
            id="title"
            value={values.title}
            onCommit={(v) => onFieldCommit('title', v)}
            placeholder="ex. Casa ampla com varanda"
            className={errors.title ? 'border-red-500 focus-visible:ring-red-500' : ''}
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <TextareaBind
            id="description"
            value={values.description || ''}
            onCommit={(v) => onFieldCommit('description', v)}
            placeholder="Descreva as características do imóvel"
            disabled={isPending}
          />
        </div>

        <div className="flex flex-row justify-between">
          <div className="flex flex-col gap-2">
            <Label htmlFor="price" className="flex items-center gap-2">
              Preço <span className="text-red-500">*</span>
              {values.price && !errors.price && <Check className="w-4 h-4 text-green-500" />}
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <BRLInput
                id="price"
                className={`pl-8 w-45 ${errors.price ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                valueDigits={values.price || ''}
                onCommit={(digits) => onFieldCommit('price', digits)}
                disabled={isPending}
              />
            </div>
            {errors.price && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.price}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="status">Status do Imóvel</Label>
            <Select
              name="imd_status"
              value={values.imd_status ?? 'À venda'}
              onValueChange={(value) => onFieldCommit('imd_status', value)}
              disabled={isPending}
            >
              <SelectTrigger className="w-45">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="type" className="flex items-center gap-2">
              Tipo de Imóvel <span className="text-red-500">*</span>
              {values.type && !errors.type && <Check className="w-4 h-4 text-green-500" />}
            </Label>
            <Select name="type" value={values.type} onValueChange={(v) => onFieldCommit('type', v)} disabled={isPending}>
              <SelectTrigger className={`w-45 ${errors.type ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.type}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Proprietário do Imóvel
            {values.prp_id && <Check className="w-4 h-4 text-green-500" />}
          </Label>

          <SearchComboBox
            className="w-full max-w-full"
            placeholder={ownersLoading ? "Carregando proprietários..." : "Digite nome, CPF/CNPJ ou telefone."}
            options={ownerOptions}
            value={values.prp_id ? String(values.prp_id) : undefined}
            loading={ownersLoading}
            onSearchChange={(q) => startTransition(() => onOwnerQueryChange(q))}
            shouldFilter={true}
            onValueChange={(id) => {
              if (id) {
                const ownerId = Number(id)
                handleOwnerSelect(ownerId)
              } else {
                onFieldCommit("prp_id", undefined)
                startTransition(() => onOwnerQueryChange(""))
              }
            }}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-base font-medium">Características e Comodidades</Label>
          <div className="flex space-x-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="ex. Piscina, Academia, Churrasqueira..."
              onKeyDown={onTagKeyDown}
              disabled={isPending}
            />
            <Button
              type="button"
              onClick={() => addTag(tagInput)}
              variant="secondary"
              disabled={!tagInput.trim() || isPending}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_TAGS.map((s) => (
              <button
                key={s}
                type="button"
                className="px-2 py-1 text-xs rounded border hover:bg-muted transition-colors flex flex-row items-center justify-center gap-1"
                onClick={() => addTag(s)}
                disabled={isPending}
                aria-label={`Adicionar ${s}`}
              >
                <Plus className="h-3 w-3" /> {s}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 pt-2 min-h-[60px]">
            {(values.features ?? []).map((feature, index) => (
              <Badge
                key={`${feature}-${index}`}
                variant="secondary"
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary/80 transition-colors"
              >
                <span>{feature}</span>
                <button
                  type="button"
                  onClick={() => removeTag(feature)}
                  className="ml-1 rounded-full p-1 hover:bg-muted transition-colors"
                  disabled={isPending}
                  aria-label={`Remover ${feature}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {(values.features ?? []).length === 0 && (
              <div className="w-full text-center py-6 text-muted-foreground">
                <Tag className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">Nenhuma característica adicionada</p>
                <p className="text-xs">Adicione características para destacar o imóvel</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}, (a, b) =>
  a.isPending === b.isPending &&
  a.owners === b.owners &&
  a.ownersLoading === b.ownersLoading &&
  shallowEqualPick(a.errors, b.errors, ['title','price','type']) &&
  shallowEqualPick(a.values, b.values, ['title','description','price','type','imd_status','prp_id','features'])
)

type LocationProps = {
  values: ReturnType<typeof usePropertyForm>['values']
  errors: ReturnType<typeof usePropertyForm>['errors']
  isPending: boolean
  estados: Array<{ id: number; name: string }>
  cidades: Array<{ id: number; name: string; stateName?: string }>
  bairros: Array<{ id: number; name: string; cityName?: string }>
  cep: {
    value: string
    format: (v: string) => string
    validate: (v: string) => boolean
    search: (v: string) => void
    isFetching: boolean
  }
  onFieldCommit: (name: any, value: any) => void
  onMany: (patch: any) => void
}

const LocationSection = memo(function LocationSection({
  values,
  errors,
  isPending,
  estados,
  cidades,
  bairros,
  cep,
  onFieldCommit,
  onMany,
}: LocationProps) {
  const [isTrans, startTransition] = useTransition()
  const hasCoordinates = !!(values.imo_latitude && values.imo_longitude)
  const coordinates = hasCoordinates
    ? { latitude: Number(values.imo_latitude), longitude: Number(values.imo_longitude) }
    : null

  const estadoNameToId = useMemo(
    () => new Map(estados.map(e => [e.name.trim().toLowerCase(), String(e.id)])),
    [estados]
  )
  const cidadeNameToId = useMemo(
    () => new Map(cidades.map(c => [c.name.trim().toLowerCase(), String(c.id)])),
    [cidades]
  )
  const bairroNameToId = useMemo(
    () => new Map(bairros.map(b => [b.name.trim().toLowerCase(), String(b.id)])),
    [bairros]
  )

  const selectedEstadoId = estadoNameToId.get((values.estado_nome ?? '').trim().toLowerCase()) ?? ''
  const selectedCidadeId = cidadeNameToId.get((values.cidade_nome ?? '').trim().toLowerCase()) ?? ''
  const selectedBairroId = bairroNameToId.get((values.bairro_nome ?? '').trim().toLowerCase()) ?? ''

  const handleEstadoChange = useCallback(
    (estadoId: string) => {
      const est = estados.find((e) => String(e.id) === estadoId)
      if (est) onMany({ estado_nome: est.name, cidade_nome: '', bairro_nome: '' })
    },
    [estados, onMany]
  )

  const handleCidadeChange = useCallback(
    (cidadeId: string) => {
      const c = cidades.find((c) => String(c.id) === cidadeId)
      if (c) onMany({ cidade_nome: c.name, bairro_nome: '' })
    },
    [cidades, onMany]
  )

  const handleBairroChange = useCallback(
    (bairroId: string) => {
      const b = bairros.find((b) => String(b.id) === bairroId)
      if (b) onFieldCommit('bairro_nome', b.name)
    },
    [bairros, onFieldCommit]
  )

  const formatCoordinate = useCallback((value: any): string => {
    const num = Number(value)
    return isNaN(num) ? '0.000000' : num.toFixed(6)
  }, [])

  const [zipLocal, setZipLocal] = React.useState(values.zipCode || '')
  React.useEffect(() => setZipLocal(values.zipCode || ''), [values.zipCode])
  const zipMasked = cep.format(zipLocal || '')

  const onCepButton = useCallback(() => {
    const clean = (zipLocal || '').replace(/\D/g, '')
    if (cep.validate(clean)) {
      onFieldCommit('zipCode', clean)
      startTransition(() => cep.search(clean))
    }
  }, [cep, zipLocal, onFieldCommit, startTransition])

  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Localização
        </CardTitle>
        <CardDescription>Digite o CEP e clique para buscar automaticamente o endereço</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="address" className="flex items-center gap-2">
            Endereço Completo <span className="text-red-500">*</span>
            {values.address && !errors.address && <Check className="w-4 h-4 text-green-500" />}
          </Label>
        </div>
        <TextFieldBind
          id="address"
          value={values.address}
          onCommit={(v) => onFieldCommit('address', v)}
          placeholder="ex. Rua das Flores, 123, Centro"
          className={errors.address ? 'border-red-500 focus-visible:ring-red-500' : ''}
          disabled={isPending}
        />
        {errors.address && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.address}
          </p>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="estado" className="flex items-center gap-2">
              Estado <span className="text-red-500">*</span>
            </Label>
            <Select value={selectedEstadoId} onValueChange={handleEstadoChange} disabled={isPending}>
              <SelectTrigger className={errors.estado_nome ? 'border-red-500' : ''}>
                <SelectValue placeholder={values.estado_nome || 'Selecione o estado'} />
              </SelectTrigger>
              <SelectContent>
                {estados.map((estado) => (
                  <SelectItem key={estado.id} value={String(estado.id)}>
                    {estado.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cidade" className="flex items-center gap-2">
              Cidade <span className="text-red-500">*</span>
            </Label>
            <Select value={selectedCidadeId} onValueChange={handleCidadeChange} disabled={isPending}>
              <SelectTrigger className={errors.cidade_nome ? 'border-red-500' : ''}>
                <SelectValue placeholder={values.cidade_nome || 'Selecione a cidade'} />
              </SelectTrigger>
              <SelectContent>
                {cidades.map((cidade) => (
                  <SelectItem key={cidade.id} value={String(cidade.id)}>
                    {cidade.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bairro" className="flex items-center gap-2">
              Bairro <span className="text-red-500">*</span>
            </Label>
            <Select value={selectedBairroId} onValueChange={handleBairroChange} disabled={isPending}>
              <SelectTrigger className={errors.bairro_nome ? 'border-red-500' : ''}>
                <SelectValue placeholder={values.bairro_nome || 'Selecione o bairro'} />
              </SelectTrigger>
              <SelectContent>
                {bairros.map((bairro) => (
                  <SelectItem key={bairro.id} value={String(bairro.id)}>
                    {bairro.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="condominio">Condomínio</Label>
          <TextFieldBind
            id="condominio"
            value={values.imo_condominio ?? ''}
            onCommit={(v) => onFieldCommit('imo_condominio', v)}
            placeholder="ex. Condomínio Parque Imperador"
            disabled={isPending}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="zipCode">CEP</Label>
            <div className="flex gap-2">
              <Input
                id="zipCode"
                value={zipMasked}
                onChange={(e) => setZipLocal(e.target.value.replace(/\D/g, ''))}
                onBlur={() => onFieldCommit('zipCode', zipLocal)}
                placeholder="00000-000"
                disabled={isPending}
              />
              <Button type="button" variant="secondary" disabled={isPending || cep.isFetching} onClick={onCepButton}>
                {cep.isFetching || isTrans ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Buscar'}
              </Button>
            </div>
          </div>
        </div>

        {hasCoordinates && coordinates && (
          <div className="bg-success-bg dark:bg-success-bg-dark border border-success-border dark:border-success-border-dark rounded-lg p-4">
            <div className="flex items-center gap-2 text-success-text dark:text-success-text-dark">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">Coordenadas Geográficas Capturadas</span>
            </div>
            <div className="mt-2 text-sm text-success-text dark:text-success-text-dark">
              <p>Latitude: {formatCoordinate(coordinates.latitude)}</p>
              <p>Longitude: {formatCoordinate(coordinates.longitude)}</p>
              <p className="text-xs mt-1">Estas coordenadas serão salvas no banco de dados</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}, (a, b) =>
  a.isPending === b.isPending &&
  a.estados === b.estados &&
  a.cidades === b.cidades &&
  a.bairros === b.bairros &&
  a.cep === b.cep &&
  shallowEqualPick(a.errors, b.errors, ['address','estado_nome','cidade_nome','bairro_nome']) &&
  shallowEqualPick(a.values, b.values, [
    'address','estado_nome','cidade_nome','bairro_nome','imo_condominio','zipCode','imo_latitude','imo_longitude'
  ])
)

type DetailsProps = {
  values: ReturnType<typeof usePropertyForm>['values']
  errors: ReturnType<typeof usePropertyForm>['errors']
  isPending: boolean
  onFieldCommit: (name: any, value: any) => void
}

const DETAILS_NUMBER_FIELDS: { key: keyof DetailsProps['values']; label: string }[] = [
  { key: 'bedrooms', label: 'Quartos' },
  { key: 'bathrooms', label: 'Banheiros' },
  { key: 'suites', label: 'Suítes' },
  { key: 'laundries', label: 'Lavanderias' },
  { key: 'escritorios', label: 'Escritórios' },
  { key: 'parking', label: 'Vagas' },
  { key: 'closets', label: 'Closets' },
  { key: 'kitchens', label: 'Cozinhas' },
  { key: 'lavabos', label: 'Lavabos' },
  { key: 'estar', label: 'Salas de Estar' },
  { key: 'jantar', label: 'Salas de Jantar' },
]

const DetailsSection = memo(function DetailsSection({
  values,
  isPending,
  onFieldCommit,
}: DetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ruler className="w-5 h-5" />
          Detalhes do Imóvel
        </CardTitle>
        <CardDescription>Quartos, banheiros, áreas e outras características</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {DETAILS_NUMBER_FIELDS.map(({ key, label }) => (
            <NumberField
              key={String(key)}
              label={label}
              value={(values as any)[key]}
              onCommit={(v) => onFieldCommit(key as any, v)}
              disabled={isPending}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NumberField
            label="Área Útil (m²)"
            value={values.area}
            onCommit={(v) => onFieldCommit('area', v)}
            disabled={isPending}
          />
          <NumberField
            label="Área Total (m²)"
            value={values.totalArea}
            onCommit={(v) => onFieldCommit('totalArea', v)}
            disabled={isPending}
          />
        </div>
      </CardContent>
    </Card>
  )
}, (a, b) =>
  a.isPending === b.isPending &&
  shallowEqualPick(a.values, b.values, [
    'bedrooms','bathrooms','suites','laundries','parking','closets','kitchens','lavabos','estar','jantar','area','totalArea','features'
  ])
)

type MediaProps = {
  images: string[]
  onAddImages: (files: File[]) => void
  onRemoveImage: (index: number) => void
  isPending: boolean
}

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024

const MediaSection = memo(function MediaSection({ images, onAddImages, onRemoveImage, isPending }: MediaProps) {
  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      if (files.length > 0) {
        const valid = files.filter((file) => {
          if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return false
          if (file.size > MAX_FILE_SIZE) return false
          return true
        })
        if (valid.length > 0) onAddImages(valid)
      }
      e.target.value = ''
    },
    [onAddImages]
  )

  const imageCount = images.length
  const mainImageText = imageCount > 0 ? 'Foto Principal' : ''

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Imagens do Imóvel
        </CardTitle>
        <CardDescription>A primeira imagem será usada como foto principal.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative">
          <div className="flex justify-center">
            <label className="relative flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-primary/50 bg-primary/5 hover:bg-primary/10 transition-colors">
              <Upload className="mb-2 h-8 w-8 text-primary" />
              <p className="mb-2 text-sm text-muted-foreground">
                <span className="font-semibold">Clique para fazer upload</span> ou arraste e solte
              </p>
              <p className="text-xs text-muted-foreground">PNG, JPG ou WEBP (máx. 5MB cada)</p>
              <input
                type="file"
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                accept={ACCEPTED_IMAGE_TYPES.join(',')}
                multiple
                onChange={handleImageUpload}
                disabled={isPending}
                aria-label="Upload de imagens"
              />
            </label>
          </div>
        </div>

        {imageCount > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium">
                {imageCount} imagem{imageCount !== 1 ? 's' : ''} selecionada{imageCount !== 1 ? 's' : ''}
              </p>
              {mainImageText && (
                <Badge variant="secondary" className="text-xs">
                  {mainImageText}
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {images.map((image, index) => (
                <div key={`image-${index}`} className="group relative aspect-square overflow-hidden rounded-lg border bg-muted">
                  <img src={image} alt={`Preview ${index + 1}`} className="h-full w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  <button
                    type="button"
                    onClick={() => onRemoveImage(index)}
                    className="absolute top-2 right-2 rounded-full bg-background/60 p-1.5 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600/40"
                    disabled={isPending}
                    aria-label={`Remover imagem ${index + 1}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                  {index === 0 && <Badge className="absolute bottom-2 left-2 text-xs">Principal</Badge>}
                </div>
              ))}
            </div>
          </div>
        )}

        {imageCount === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <ImageIcon className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm">Nenhuma imagem selecionada</p>
            <p className="text-xs">Adicione fotos para destacar o imóvel</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
})

type PreviewValues = ReturnType<typeof usePropertyForm>['values']

const PreviewVisual = memo(function PreviewVisual({
  values,
  images,
}: {
  values: PreviewValues
  images: string[]
}) {
  const previewDetails = useMemo(() => {
    const toEntry = (label: string, v?: string) => (v ? `${label}: ${v}` : null)
    const mapNum = (v?: string) => (v && v !== '0' ? v : '')
    return [
      toEntry('Quartos', mapNum(values.bedrooms)),
      toEntry('Suítes', mapNum(values.suites)),
      toEntry('Banheiros', mapNum(values.bathrooms)),
      toEntry('Lavanderias', mapNum(values.laundries)),
      toEntry('Closets', mapNum(values.closets)),
      toEntry('Cozinhas', mapNum(values.kitchens)),
      toEntry('Lavabos', mapNum(values.lavabos)),
      toEntry('Sala de estar', mapNum(values.estar)),
      toEntry('Sala de jantar', mapNum(values.jantar)),
      toEntry('Vagas', mapNum(values.parking)),
      toEntry('Área útil', values.area ? `${values.area} m²` : ''),
      toEntry('Área total', values.totalArea ? `${values.totalArea} m²` : ''),
    ].filter(Boolean) as string[]
  }, [values])

  return (
    <div className="space-y-3">
      <div className="aspect-video rounded-lg overflow-hidden bg-muted flex items-center justify-center">
        {images[0] ? (
          <img src={images[0]} alt="Preview principal" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center text-muted-foreground">
            <ImageIcon className="mx-auto h-12 w-12 mb-2 opacity-50" />
            <p className="text-sm">Foto principal</p>
          </div>
        )}
      </div>

      <h4 className="font-semibold line-clamp-2">{values.title || 'Título do imóvel'}</h4>
      <p className="text-sm text-muted-foreground">
        {values.type || 'Tipo'} • {values.address || 'Endereço'}
        {values.imd_status && ` • ${values.imd_status}`}
      </p>
      <div className="text-2xl font-bold text-primary">
        {formatBRLFromDigits(values.price || '') || 'R$ 0,00'}
      </div>

      {previewDetails.length > 0 && (
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {previewDetails.map((item, i) => (
            <span key={i} className="px-2 py-1 rounded bg-muted">
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}, (a, b) =>
  a.images === b.images &&
  shallowEqualPick(a.values, b.values, [
    'title','type','address','imd_status','price',
    'bedrooms','suites','bathrooms','laundries',
    'closets','kitchens','lavabos','estar','jantar',
    'parking','area','totalArea'
  ])
)
