import { z } from 'zod'

const BackendUserSchemaA = z.object({
  id: z.coerce.number(),
  usu_nome: z.string(),
  usu_email: z.string().email(),
  usu_foto: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
})

const BackendUserSchemaB = z.object({
  id: z.coerce.number(),
  nome: z.string(),
  email: z.string().email(),
  foto: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
})

const RawUserSchema = z.union([BackendUserSchemaA, BackendUserSchemaB])

export const UserSchema = RawUserSchema.transform((data: any) => ({
  id: Number(data.id),
  name: data.usu_nome ?? data.nome ?? '',
  email: data.usu_email ?? data.email ?? '',
  photo: (data.usu_foto ?? data.foto) || null,
  createdAt: data.created_at ?? '',
  updatedAt: data.updated_at ?? ''
}))

export type User = z.infer<typeof UserSchema>

export const LoginRequestSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(1, 'Senha é obrigatória')
})

export const LoginResponseSchema = z.object({
  status: z.literal('success'),
  token: z.string(),
  user: z.object({
    id: z.coerce.number(),
    nome: z.string(),
    email: z.string(),
    foto: z.string().nullable().optional()
  })
})

export type LoginRequest = z.infer<typeof LoginRequestSchema>
export type LoginResponse = z.infer<typeof LoginResponseSchema>
