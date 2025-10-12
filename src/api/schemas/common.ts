import { z } from 'zod'

export const ApiResponseSchema = z.object({
  status: z.enum(['success', 'error']),
  message: z.string().optional(),
  error: z.string().optional(),
  data: z.unknown().optional()
})

export const PaginatedResponseSchema = ApiResponseSchema.extend({
  data: z.unknown(),
  total: z.number(),
  page: z.number().optional(),
  per_page: z.number().optional()
})

export const FormDataSchema = z.object({
  append: z.function()
})

export type ApiResponse<T = unknown> = {
  status: 'success' | 'error'
  message?: string
  error?: string
  data?: T
}

export type PaginatedResponse<T> = ApiResponse<T> & {
  total: number
  page?: number
  per_page?: number
}