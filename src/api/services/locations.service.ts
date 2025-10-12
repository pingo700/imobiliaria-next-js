import { apiClient } from '../core/client'
import { EstadoSchema, CidadeSchema, BairroSchema } from '../schemas/location'
import { ApiResponseSchema } from '../schemas/common'
import type { Estado, Cidade, Bairro } from '../schemas/location'

async function currentUserId(): Promise<number | undefined> {
  try {
    const me = await apiClient.request<any>('/auth/me', { method: 'GET' })
    const id = Number(me?.user?.id ?? me?.id ?? me?.user?.sub ?? 0) || 0
    return id || undefined
  } catch {
    return undefined
  }
}

export const locationsService = {
  async getEstados(): Promise<Estado[]> {
    const r = await apiClient.request('/estados')
    const v = ApiResponseSchema.extend({ data: EstadoSchema.array() }).parse(r)
    return v.data || []
  },

  async getCidades(): Promise<Cidade[]> {
    const r = await apiClient.request('/cidades')
    const v = ApiResponseSchema.extend({ data: CidadeSchema.array() }).parse(r)
    return v.data || []
  },

  async getBairros(): Promise<Bairro[]> {
    const r = await apiClient.request('/bairros')
    const v = ApiResponseSchema.extend({ data: BairroSchema.array() }).parse(r)
    return v.data || []
  },

  async getCidadesByEstado(estadoId: number): Promise<Cidade[]> {
    const r = await apiClient.request(`/estados/${estadoId}/cidades`)
    const v = ApiResponseSchema.extend({ data: CidadeSchema.array() }).parse(r)
    return v.data || []
  },

  async getBairrosByCidade(cidadeId: number): Promise<Bairro[]> {
    const r = await apiClient.request(`/cidades/${cidadeId}/bairros`)
    const v = ApiResponseSchema.extend({ data: BairroSchema.array() }).parse(r)
    return v.data || []
  },

  async createEstado(data: { est_nome: string }) {
    const uid = await currentUserId()
    const payload = { est_nome: data.est_nome, ...(uid ? { usu_created: uid, usu_updated: uid } : {}) }
    const r = await apiClient.request('/admin/cadastrar/estado', { method: 'POST', json: payload })
    return ApiResponseSchema.parse(r)
  },

  async createCidade(data: { cid_nome: string; est_id: number }) {
    const uid = await currentUserId()
    const payload = { cid_nome: data.cid_nome, est_id: data.est_id, ...(uid ? { usu_created: uid, usu_updated: uid } : {}) }
    const r = await apiClient.request('/admin/cadastrar/cidade', { method: 'POST', json: payload })
    return ApiResponseSchema.parse(r)
  },

  async createBairro(data: { bai_nome: string; cid_id: number }) {
    const uid = await currentUserId()
    const payload = { bai_nome: data.bai_nome, cid_id: data.cid_id, ...(uid ? { usu_created: uid, usu_updated: uid } : {}) }
    const r = await apiClient.request('/admin/cadastrar/bairro', { method: 'POST', json: payload })
    return ApiResponseSchema.parse(r)
  },

  async deleteEstado(id: number) {
    return apiClient.request(`/admin/excluir/estado/${id}`, { method: 'DELETE' })
  },

  async deleteCidade(id: number) {
    return apiClient.request(`/admin/excluir/cidade/${id}`, { method: 'DELETE' })
  },

  async deleteBairro(id: number) {
    return apiClient.request(`/admin/excluir/bairro/${id}`, { method: 'DELETE' })
  }
}
