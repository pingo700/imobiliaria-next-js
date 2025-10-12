'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { propertiesService } from '../../services/properties.service'
import { queryKeys } from '../../keys'
import { toast } from 'sonner'

async function notifyRevalidate(tags: string[]) {
  try {
    await fetch('/api/revalidate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ tags })
    })
  } catch {}
}

export function useCreateProperty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (formData: FormData) => propertiesService.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.all() })
      notifyRevalidate(['properties'])
      toast.success('Imóvel cadastrado com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao cadastrar imóvel')
    }
  })
}

export function useUpdateProperty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, formData }: { id: number, formData: FormData }) => propertiesService.update(id, formData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.all() })
      notifyRevalidate(['properties'])
      toast.success('Imóvel atualizado com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar imóvel')
    }
  })
}

export function useDeleteProperty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => propertiesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.all() })
      notifyRevalidate(['properties'])
      toast.success('Imóvel excluído com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao excluir imóvel')
    }
  })
}
