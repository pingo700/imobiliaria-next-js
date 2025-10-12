import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ownersService } from '../../services/owners.service'
import { queryKeys } from '../../keys'
import { toast } from 'sonner'
import type { Owner, CreateOwnerData } from '../../schemas/owner'

const normalize = (o: Owner) => ({ ...o, id: Number(o.id) })
export function useOwners() {
  return useQuery({
    queryKey: queryKeys.owners.all(),
    queryFn: ownersService.getAll,
    select: (arr) => {
      const seen = new Set<number>()
      return (arr ?? []).map(normalize).filter(o => o.id && !seen.has(o.id) && seen.add(o.id))
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  })
}

export function useOwner(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.owners.detail(id!),
    queryFn: () => ownersService.getById(id!),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  })
}

export function useOwnerSearch(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.owners.search(query),
    queryFn: () => ownersService.search(query),
    enabled: enabled && query.length >= 2,
    staleTime: 5 * 60 * 1000,
    placeholderData: [],
  })
}

export function useCreateOwner() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateOwnerData) => ownersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.owners.all() 
      })
      toast.success('Proprietário cadastrado com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao cadastrar proprietário')
    }
  })
}

export function useUpdateOwner() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number, data: CreateOwnerData }) => 
      ownersService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.owners.detail(variables.id) 
      })
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.owners.all() 
      })
      toast.success('Proprietário atualizado com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar proprietário')
    }
  })
}

export function useDeleteOwner() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => ownersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.owners.all() 
      })
      toast.success('Proprietário excluído com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao excluir proprietário')
    }
  })
}

