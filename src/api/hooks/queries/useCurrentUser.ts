'use client'
import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'

export type CurrentUser = { id: number | string; nome: string; email: string; foto: string | null } | null

export function useCurrentUser() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const data = await apiFetch<any>('/api/auth/me', { method: 'GET', cache: 'no-store' })
      if (!data?.authenticated || !data?.user) return null
      const u = data.user
      return {
        id: u.id ?? u.user?.id ?? u.sub ?? null,
        nome: u.nome ?? u.name ?? u.user?.nome ?? '',
        email: u.email ?? u.user?.email ?? '',
        foto: u.foto ?? u.photo ?? u.picture ?? null,
      } as CurrentUser
    },
  })
}
