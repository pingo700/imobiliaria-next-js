import { z } from 'zod'

const optNum = () =>
  z.preprocess((v) => (v === '' || v === null || v === undefined ? undefined : v), z.coerce.number())

const nullNum = () =>
  z.preprocess((v) => (v === '' || v === null || v === undefined ? null : v), z.coerce.number())

const IMG_HOST = 'https://Sistemaimobiliariavga.com.br/'
function toImageUrl(p?: string | null): string {
  const s = (p ?? '').trim()
  if (!s) return ''
  if (/^https?:\/\//i.test(s)) return s
  let path = s.replace(/^\/+/, '')
  if (!path.startsWith('public/')) path = `public/${path}`
  return `${IMG_HOST}${path}`
}

const BackendPropertyDescriptionSchema = z.object({
  id: optNum().optional(),
  imd_quartos: nullNum().nullable().optional(),
  imd_banheiros: nullNum().nullable().optional(),
  imd_suites: nullNum().nullable().optional(),
  imd_lavanderias: nullNum().nullable().optional(),
  imd_escritorios: nullNum().nullable().optional(),
  imd_vagas: nullNum().nullable().optional(),
  imd_area_util: nullNum().nullable().optional(),
  imd_area_total: nullNum().nullable().optional(),
  imd_descricao: z.string().nullable().optional(),
  imd_status: z.string().nullable().optional(),
  imd_closets: nullNum().nullable().optional(),
  imd_cozinhas: nullNum().nullable().optional(),
  imd_lavabos: nullNum().nullable().optional(),
  imd_sala_estar: nullNum().nullable().optional(),
  imd_sala_jantar: nullNum().nullable().optional(),
}).passthrough()

const BackendPropertySchema = z.object({
  id: z.coerce.number(),
  imo_nome: z.string(),
  imo_slug: z.string().nullable().optional(),
  imo_categoria: z.enum(['Casa', 'Apartamento', 'Terreno', 'Comercial']),
  imo_valor: nullNum().nullable().optional(),
  imo_endereco: z.string().nullable().optional(),
  imo_cep: z.string().nullable().optional(),
  imo_latitude: nullNum().nullable().optional(),
  imo_longitude: nullNum().nullable().optional(),
  imo_condominio: z.string().nullable().optional(),
  bai_id: nullNum().nullable().optional(),
  estado_nome: z.string().optional(),
  cidade_nome: z.string().optional(),
  bairro_nome: z.string().optional(),
  prp_nome: z.string().optional(),
  usu_created: optNum().optional(),
  usu_updated: optNum().optional(),
  descricao: BackendPropertyDescriptionSchema.optional(),
  caracteristicas: z.array(z.string()).optional(),
  imo_fotos: z.array(z.object({ imo_foto: z.string() })).optional(),
  created_at: z.string(),
  updated_at: z.string(),
  deletedAt: z.string().nullable().optional(),
}).passthrough()

export const PropertySchema = BackendPropertySchema.transform(data => ({
  id: data.id,
  name: data.imo_nome,
  slug: data.imo_slug || '',
  category: data.imo_categoria,
  price: data.imo_valor ?? 0,
  address: data.imo_endereco || '',
  zipCode: data.imo_cep || '',
  coordinates:
    data.imo_latitude != null && data.imo_longitude != null
      ? { lat: data.imo_latitude, lng: data.imo_longitude }
      : null,
  condominium: data.imo_condominio || '',
  neighborhoodId: data.bai_id ?? null,
  location: {
    state: data.estado_nome || '',
    city: data.cidade_nome || '',
    neighborhood: data.bairro_nome || ''
  },
  ownerName: data.prp_nome || '',
  createdBy: data.usu_created,
  updatedBy: data.usu_updated,
  details: data.descricao
    ? {
        bedrooms: data.descricao.imd_quartos ?? 0,
        bathrooms: data.descricao.imd_banheiros ?? 0,
        suites: data.descricao.imd_suites ?? 0,
        laundries: data.descricao.imd_lavanderias ?? 0,
        escritorios: data.descricao.imd_escritorios ?? 0,
        parking: data.descricao.imd_vagas ?? 0,
        usableArea: data.descricao.imd_area_util ?? 0,
        totalArea: data.descricao.imd_area_total ?? 0,
        description: data.descricao.imd_descricao || '',
        status: data.descricao.imd_status || 'À venda',

        closets: data.descricao.imd_closets ?? 0,
        kitchens: data.descricao.imd_cozinhas ?? 0,
        lavabos: data.descricao.imd_lavabos ?? 0,
        estar: data.descricao.imd_sala_estar ?? 0,
        jantar: data.descricao.imd_sala_jantar ?? 0,
      }
    : null,
  features: data.caracteristicas || [],
  images: (data.imo_fotos?.map(f => toImageUrl(f.imo_foto)).filter(Boolean) as string[]) || [],
  createdAt: data.created_at,
  updatedAt: data.updated_at,
  deletedAt: data.deleted_at,
  
}))

export type Property = z.infer<typeof PropertySchema>

export const PropertyFormDataSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  type: z.enum(['Casa', 'Apartamento', 'Terreno', 'Comercial']),
  price: z.string(),
  address: z.string(),
  zipCode: z.string().optional(),
  imo_condominio: z.string().optional(),
  imo_latitude: optNum().optional(),
  imo_longitude: optNum().optional(),
  estado_nome: z.string().optional(),
  cidade_nome: z.string().optional(),
  bairro_nome: z.string().optional(),

  bedrooms: z.string().optional(),
  bathrooms: z.string().optional(),
  suites: z.string().optional(),
  laundries: z.string().optional(),
  escritorios: z.string().optional(),
  parking: z.string().optional(),
  area: z.string().optional(),
  totalArea: z.string().optional(),
  description: z.string().optional(),
  imd_status: z.string().default('À venda'),
  features: z.array(z.string()).optional(),
  prp_id: optNum().optional(),

  closets: z.string().optional(),
  kitchens: z.string().optional(),
  lavabos: z.string().optional(),
  estar: z.string().optional(),
  jantar: z.string().optional(),
})

export type PropertyFormData = z.infer<typeof PropertyFormDataSchema>
