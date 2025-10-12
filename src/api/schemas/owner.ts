import { z } from 'zod'

const BackendOwnerSchema = z.object({
  id: z.coerce.number(),
  prp_nome: z.string(),
  prp_documento: z.string().nullable().optional(),
  prp_email: z.string().nullable().optional(),
  prp_telefone: z.string(),
  usu_created: z.coerce.number(),
  usu_updated: z.coerce.number(),
  created_at: z.string(),
  updated_at: z.string()
})

export const OwnerSchema = BackendOwnerSchema.transform(data => ({
  id: data.id,
  name: data.prp_nome,
  document: data.prp_documento || null,
  email: data.prp_email || null,
  phone: data.prp_telefone,
  createdBy: data.usu_created,
  updatedBy: data.usu_updated,
  createdAt: data.created_at,
  updatedAt: data.updated_at
}))

export type Owner = z.infer<typeof OwnerSchema>

export const CreateOwnerSchema = z.object({
  prp_nome: z.string().optional(),
  prp_documento: z.string().optional(),
  prp_email: z.string().email().optional(),
  prp_telefone: z.string().optional(),
})

export type CreateOwnerData = z.infer<typeof CreateOwnerSchema>
