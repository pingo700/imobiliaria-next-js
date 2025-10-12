import { apiClient } from '../core/client'
import type { User } from '../schemas/user'

function pickPayload(resp: any): any {
  if (resp == null) return resp
  if (typeof resp !== 'object') return resp
  if ('data' in resp) return (resp as any).data
  if ('user' in resp) return (resp as any).user
  if ('usuario' in resp) return (resp as any).usuario
  return resp
}

function firstIfArray<T>(v: T | T[]): T {
  return Array.isArray(v) ? (v[0] as T) : (v as T)
}

function normStr(v: any): string | null {
  if (v == null) return null
  const s = String(v).trim()
  return s.length ? s : null
}

function toNumberOrNaN(v: any): number {
  if (v == null || v === '') return NaN
  const n = Number(v)
  return Number.isFinite(n) ? n : NaN
}

function normalizeUser(raw: any): User {
  const u = firstIfArray(pickPayload(raw))

  const id =
    toNumberOrNaN(u?.id) ??
    toNumberOrNaN(u?.usu_id) ??
    toNumberOrNaN(u?.user_id)

  const name =
    normStr(u?.usu_nome) ??
    normStr(u?.nome) ??
    normStr(u?.name) ??
    ''

  const email =
    normStr(u?.usu_email) ??
    normStr(u?.email) ??
    normStr(u?.mail) ??
    ''

  const photo =
    normStr(u?.usu_foto) ??
    normStr(u?.foto) ??
    normStr(u?.photo) ??
    null

  const createdAt =
    normStr(u?.created_at) ??
    normStr(u?.createdAt) ??
    null

  const updatedAt =
    normStr(u?.updated_at) ??
    normStr(u?.updatedAt) ??
    null

  if (!Number.isFinite(id)) {
    throw new Error(
      'usersService.getById: resposta sem id válido. Preview=' +
        JSON.stringify(raw)?.slice(0, 400)
    )
  }

  return {
    id: id as number,
    name,
    email,
    photo,
    createdAt: createdAt ?? '',
    updatedAt: updatedAt ?? '',
  }
}

function normalizeUserList(raw: any): User[] {
  const payload = pickPayload(raw)
  const arr = Array.isArray(payload) ? payload : [payload]
  return arr.map(normalizeUser)
}

export const usersService = {
  async getAll(): Promise<User[]> {
    const response = await apiClient.request('/admin/listar/usuarios')
    return normalizeUserList(response)
  },

  async getById(id: number): Promise<User> {
    const response = await apiClient.request(`/admin/detalhes/usuario/${id}`)
    return normalizeUser(response)
  },

  async create(data: {
    usu_nome: string
    usu_email: string
    usu_senha: string
    usu_foto?: File
  }) {
    const formData = new FormData()
    formData.append('usu_nome', data.usu_nome)
    formData.append('usu_email', data.usu_email)
    formData.append('usu_senha', data.usu_senha)
    if (data.usu_foto) formData.append('usu_foto', data.usu_foto)
    return apiClient.request('/admin/cadastrar/usuario', {
      method: 'POST',
      body: formData
    })
  },

  async update(id: number, data: {
    usu_nome?: string
    usu_email?: string
    usu_senha?: string
    usu_foto?: File
  }) {
    const formData = new FormData()
    if (data.usu_nome) formData.append('usu_nome', data.usu_nome)
    if (data.usu_email) formData.append('usu_email', data.usu_email)
    if (data.usu_senha) formData.append('usu_senha', data.usu_senha)
    if (data.usu_foto) formData.append('usu_foto', data.usu_foto)
    return apiClient.request(`/admin/editar/usuario/${id}`, {
      method: 'PUT',
      body: formData
    })
  },

  async delete(id: number) {
    return apiClient.request(`/admin/excluir/usuario/${id}`, {
      method: 'DELETE'
    })
  },

  async search(query: string): Promise<User[]> {
    const response = await apiClient.request(`/usuarios/buscar?query=${encodeURIComponent(query)}`)
    return normalizeUserList(response)
  }
}
