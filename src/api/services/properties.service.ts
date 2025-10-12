import { apiClient, ApiError } from '../core/client'
import { PropertySchema } from '../schemas/property'
import { ApiResponseSchema } from '../schemas/common'
import type { Property, PropertyFormData } from '../schemas/property'
import { z } from 'zod'

const unwrapOne = <T>(resp: unknown, item: z.ZodType<T>): T => {
  const r = resp as any
  const payload = r && typeof r === 'object' ? ('data' in r ? r.data : r) : r
  return item.parse(payload)
}

const unwrapMany = <T>(resp: unknown, item: z.ZodType<T>): T[] => {
  const r = resp as any
  const payload = r && typeof r === 'object' ? ('data' in r ? r.data : r) : r

  if (Array.isArray(payload)) return payload.map((x) => item.parse(x))
  if (payload && Array.isArray(payload.items)) return payload.items.map((x: any) => item.parse(x))
  return []
}

const normalizeList = (resp: unknown): Property[] => {
  const asApi = ApiResponseSchema.extend({ data: PropertySchema.array() }).safeParse(resp)
  if (asApi.success) return asApi.data.data || []
  if (Array.isArray(resp)) return resp.map((x) => PropertySchema.parse(x))
  return []
}

async function currentUserId(): Promise<number | undefined> {
  try {
    const me = await apiClient.request<any>('/auth/me', { method: 'GET' })
    const id = Number(me?.user?.id ?? me?.id ?? me?.user?.sub ?? 0) || 0
    return id || undefined
  } catch {
    return undefined
  }
}

function ensureAuditOnForm(fd: FormData, uid?: number) {
  if (!uid) return
  if (!fd.has('usu_created')) fd.append('usu_created', String(uid))
  if (!fd.has('usu_updated')) fd.append('usu_updated', String(uid))
}

export const propertiesService = {
  async getAll(): Promise<Property[]> {
    const resp = await apiClient.request('/admin/listar/imoveis')
    return unwrapMany(resp, PropertySchema)
  },

  async getPublic(): Promise<Property[]> {
    const resp = await apiClient.request('/imoveis')
    return unwrapMany(resp, PropertySchema)
  },

  async getById(id: number): Promise<Property> {
    const resp = await apiClient.request(`/admin/detalhes/imovel/${id}`)
    return unwrapOne(resp, PropertySchema)
  },

  async getBySlug(slug: string): Promise<Property> {
    const resp = await apiClient.request(`/imoveis/${slug}`)
    return unwrapOne(resp, PropertySchema)
  },
  
  async create(formData: FormData) {
    const uid = await currentUserId()
    ensureAuditOnForm(formData, uid)
    const response = await apiClient.request('/admin/cadastrar/imovel', { method: 'POST', body: formData })
    return response
  },

  async update(id: number, formData: FormData) {
    const uid = await currentUserId()
    ensureAuditOnForm(formData, uid)
    const response = await apiClient.request(`/admin/editar/imovel/${id}`, { method: 'POST', body: formData })
    return response
  },

  async delete(id: number) {
    const response = await apiClient.request(`/admin/excluir/imovel/${id}`, { method: 'DELETE' })
    return response
  },

  async search(params: {
    query?: string
    categoria?: string
    preco_min?: number
    preco_max?: number
    estado_id?: number
    cidade_id?: number
    bai_id?: number
    quartos_min?: number
  }): Promise<Property[]> {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') queryParams.append(key, String(value))
    })
    if ([...queryParams.keys()].length === 0) return this.getPublic()
    const qs = queryParams.toString()
    try {
      const response = await apiClient.request(`/imoveis?${qs}`)
      return normalizeList(response)
    } catch {
      const response = await apiClient.request(`/imoveis/buscar?${qs}`)
      return normalizeList(response)
    }
  },

  createFormData(data: PropertyFormData, images?: File[]): FormData {
    const formData = new FormData()
    const onlyDigits = (s: string | number | undefined | null) => String(s ?? '').replace(/\D/g, '')
    const toDecimalBR = (digits: string) => {
      if (!digits) return ''
      const n = Number(digits) / 100
      return String(n).replace(',', '.')
    }

    const priceDigits = onlyDigits(data.price)
    const priceDecimal = toDecimalBR(priceDigits)
    const cepDigits = onlyDigits(data.zipCode)

    const map: Record<string, any> = {
      imo_nome: data.title,
      imo_categoria: data.type,
      imo_valor: priceDecimal,
      imo_endereco: data.address,
      imo_cep: cepDigits,
      imo_latitude: data.imo_latitude ?? '',
      imo_longitude: data.imo_longitude ?? '',
      imo_condominio: data.imo_condominio ?? '',
      estado_nome: data.estado_nome ?? '',
      cidade_nome: data.cidade_nome ?? '',
      bairro_nome: data.bairro_nome ?? '',
      imd_status: data.imd_status ?? 'À venda',
      description: data.description ?? '',
      bedrooms: data.bedrooms ?? '',
      bathrooms: data.bathrooms ?? '',
      suites: data.suites ?? '',
      laundries: data.laundries ?? '',
      escritorios: data.escritorios ?? '',
      closets: data.closets ?? '',
      kitchens: data.kitchens ?? '',
      lavabos: data.lavabos ?? '',
      estar: data.estar ?? '',
      jantar: data.jantar ?? '',
      parking: data.parking ?? '',
      area: data.area ?? '',
      totalArea: data.totalArea ?? '',
      prp_id: data.prp_id ?? '',
    }

    Object.entries(map).forEach(([k, v]) => {
      const val = typeof v === 'string' ? v.trim() : v
      if (val !== '' && val !== undefined && val !== null) formData.append(k, String(val))
    })
  
    if (data.type) formData.append('type', data.type)
    if (priceDigits) formData.append('price', priceDigits)
    if (data.title) formData.append('title', data.title)
    if (data.zipCode) formData.append('zipCode', onlyDigits(data.zipCode))
    if (data.imo_latitude != null) formData.append('latitude', String(data.imo_latitude))
    if (data.imo_longitude != null) formData.append('longitude', String(data.imo_longitude))

    if (Array.isArray(data.features)) {
      data.features.forEach((tag, i) => {
        if (tag && tag.trim()) formData.append(`features[${i}]`, tag.trim())
      })
    }
    if (images?.length) images.forEach((img, i) => formData.append(`images[${i}]`, img))

    return formData
  },
}
