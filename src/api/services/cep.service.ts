import { z } from 'zod'
import { apiClient } from '../core/client'

export const CepResponseSchema = z.object({
  cep: z.string(),
  logradouro: z.string(),
  complemento: z.string().optional(),
  bairro: z.string(),
  localidade: z.string(),
  uf: z.string(),
  estado: z.string().optional(),
  estadoNome: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional()
})

export type CepData = z.infer<typeof CepResponseSchema>

export const cepService = {
  async search(cep: string): Promise<CepData> {
    const clean = cep.replace(/\D/g, '')
    if (clean.length !== 8) throw new Error('CEP deve ter 8 dígitos')
    const data = await apiClient.request(`/cep?cep=${clean}`)
    return CepResponseSchema.parse(data)
  },
  formatCep(cep: string): string {
    const clean = cep.replace(/\D/g, '')
    if (clean.length === 8) return `${clean.slice(0, 5)}-${clean.slice(5)}`
    return cep
  },
  validateFormat(cep: string): boolean {
    const clean = cep.replace(/\D/g, '')
    return clean.length === 8 && /^\d{8}$/.test(clean)
  }
}
