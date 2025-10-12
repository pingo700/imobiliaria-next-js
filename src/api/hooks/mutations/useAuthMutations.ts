"use client"

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authService } from '../../services/auth.service'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import type { LoginRequest } from '../../schemas/user'

export function useLogin() {
  const queryClient = useQueryClient()
  const router = useRouter()
  return useMutation({
    mutationFn: (credentials: LoginRequest & { csrfToken?: string }) =>
      authService.login(credentials),
    onSuccess: (data) => {
      queryClient.setQueryData(['api','auth','user'], data.user)
      toast.success('Login realizado com sucesso!')
      const next = typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('next')
        : null
      router.replace(next || '/admin')
      router.refresh()
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Erro ao fazer login'
      toast.error(message)
    }
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  const router = useRouter()
  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.clear()
      toast.success('Logout realizado com sucesso!')
      router.replace('/login')
      router.refresh()
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Erro ao fazer logout'
      toast.error(message)
    }
  })
}
