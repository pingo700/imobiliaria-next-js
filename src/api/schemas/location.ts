import { z } from 'zod'

const optNum = () =>
  z.preprocess((v) => (v === '' || v === null || v === undefined ? undefined : v), z.coerce.number())

const BackendEstadoSchema = z.object({
  id: z.coerce.number(),
  est_nome: z.string(),
  est_slug: z.string(),
  created_at: z.string(),
  updated_at: z.string()
})

export const EstadoSchema = BackendEstadoSchema.transform(data => ({
  id: data.id,
  name: data.est_nome,
  slug: data.est_slug,
  createdAt: data.created_at,
  updatedAt: data.updated_at
}))

const BackendCidadeSchema = z.object({
  id: z.coerce.number(),
  cid_nome: z.string(),
  cid_slug: z.string(),
  est_id: optNum().optional(),
  est_nome: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string()
})

export const CidadeSchema = BackendCidadeSchema.transform(data => ({
  id: data.id,
  name: data.cid_nome,
  slug: data.cid_slug,
  stateId: data.est_id,
  stateName: data.est_nome,
  createdAt: data.created_at,
  updatedAt: data.updated_at
}))

const BackendBairroSchema = z.object({
  id: z.coerce.number(),
  bai_nome: z.string(),
  bai_slug: z.string(),
  cid_id: optNum().optional(),
  cid_nome: z.string().optional(),
  est_id: optNum().optional(),
  est_nome: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string()
})

export const BairroSchema = BackendBairroSchema.transform(data => ({
  id: data.id,
  name: data.bai_nome,
  slug: data.bai_slug,
  cityId: data.cid_id,
  cityName: data.cid_nome,
  stateId: data.est_id,
  stateName: data.est_nome,
  createdAt: data.created_at,
  updatedAt: data.updated_at
}))

export type Estado = z.infer<typeof EstadoSchema>
export type Cidade = z.infer<typeof CidadeSchema>
export type Bairro = z.infer<typeof BairroSchema>

export const CreateEstadoSchema = z.object({
  est_nome: z.string().min(1, 'Nome é obrigatório')
})

export const CreateCidadeSchema = z.object({
  cid_nome: z.string().min(1, 'Nome é obrigatório'),
  est_id: z.coerce.number().min(1, 'Estado é obrigatório')
})

export const CreateBairroSchema = z.object({
  bai_nome: z.string().min(1, 'Nome é obrigatório'),
  cid_id: z.coerce.number().min(1, 'Cidade é obrigatória')
})
