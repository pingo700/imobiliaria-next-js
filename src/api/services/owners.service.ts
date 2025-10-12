// src/api/services/owners.service.ts
import { apiClient } from '../core/client'
import type { Owner, CreateOwnerData } from '../schemas/owner'

const ROUTES = {
  list: '/admin/listar/proprietarios',
  detail: (id: number) => `/admin/detalhes/proprietario/${id}`,
  search: (q: string) => `/admin/buscar/proprietarios?q=${encodeURIComponent(q)}`,
  create: '/admin/cadastrar/proprietario',
  update: (id: number) => `/admin/editar/proprietario/${id}`,
  delete: (id: number) => `/admin/excluir/proprietario/${id}`,
}

const unwrap = (resp: any) => (resp && typeof resp === 'object' && 'data' in resp ? resp.data : resp)

function decodeApiOwner(api: any): Owner {
  const toNum = (v: any): number => {
    const n = Number(v)
    return Number.isFinite(n) ? n : 0
  }
  const toStr = (v: any): string => (v == null ? '' : String(v))
  const toOptStr = (v: any): string | null => (v == null || v === '' ? null : String(v))
  const toIsoOrEmpty = (v: any): string => {
    const d =
      v instanceof Date ? v :
        typeof v === 'number' ? new Date(v) :
          typeof v === 'string' ? new Date(v) :
            null
    return d && !isNaN(d.getTime()) ? d.toISOString() : ''
  }

  return {
    id: toNum(api?.id ?? api?.prp_id ?? api?.owner_id),
    name: toStr(api?.name ?? api?.nome ?? api?.prp_nome),
    document: toOptStr(api?.document ?? api?.cpf ?? api?.cnpj ?? api?.doc),
    email: toOptStr(api?.email ?? api?.emailAddress ?? api?.mail ?? api?.prp_email) ?? null,
    phone: toStr(api?.phone ?? api?.telefone ?? api?.celular),
    createdBy: toNum(api?.createdBy ?? api?.created_by ?? api?.usuario_criacao ?? api?.prp_usuario_criador),
    updatedBy: toNum(api?.updatedBy ?? api?.updated_by ?? api?.usuario_atualizacao ?? api?.prp_usuario_atualizador),
    createdAt: toIsoOrEmpty(api?.createdAt ?? api?.created_at ?? api?.dtCriacao ?? api?.dt_criacao),
    updatedAt: toIsoOrEmpty(api?.updatedAt ?? api?.updated_at ?? api?.dtAtualizacao ?? api?.dt_atualizacao),
  }
}

export const ownersService = {
  async getAll(): Promise<Owner[]> {
    const resp = await apiClient.request(ROUTES.list, { method: 'GET' })
    const payload = unwrap(resp)
    const arr = Array.isArray(payload) ? payload : (Array.isArray(payload?.items) ? payload.items : [])
    return arr.map(decodeApiOwner).filter((o: Owner) => o.id > 0)
  },

  async getById(id: number): Promise<Owner> {
    const resp = await apiClient.request(ROUTES.detail(id), { method: 'GET' })
    const raw = unwrap(resp)
    return decodeApiOwner(raw)
  },

  async search(query: string): Promise<Owner[]> {
    const resp = await apiClient.request(ROUTES.search(query), { method: 'GET' })
    const payload = unwrap(resp)
    const arr = Array.isArray(payload) ? payload : (Array.isArray(payload?.items) ? payload.items : [])
    return arr.map(decodeApiOwner).filter((o: Owner) => o.id > 0)
  },

  async create(data: CreateOwnerData) {
    return apiClient.request(ROUTES.create, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async update(id: number, data: CreateOwnerData) {
    return apiClient.request(ROUTES.update(id), {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async delete(id: number) {
    return apiClient.request(ROUTES.delete(id), { method: 'DELETE' })
  },
}
