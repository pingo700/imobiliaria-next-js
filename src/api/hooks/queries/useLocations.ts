import { useQuery } from '@tanstack/react-query'
import { locationsService } from '../../services/locations.service'
import { queryKeys } from '../../keys'

export function useEstados() {
  return useQuery({
    queryKey: queryKeys.locations.estados(),
    queryFn: locationsService.getEstados,
    staleTime: 30 * 60 * 1000, // 30 minutos
    gcTime: 60 * 60 * 1000, // 1 hora
  })
}

export function useCidades() {
  return useQuery({
    queryKey: queryKeys.locations.cidades(),
    queryFn: locationsService.getCidades,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  })
}

export function useBairros() {
  return useQuery({
    queryKey: queryKeys.locations.bairros(),
    queryFn: locationsService.getBairros,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  })
}

export function useCidadesByEstado(estadoId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.locations.cidadesByEstado(estadoId!),
    queryFn: () => locationsService.getCidadesByEstado(estadoId!),
    enabled: !!estadoId,
    staleTime: 30 * 60 * 1000,
  })
}

export function useBairrosByCidade(cidadeId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.locations.bairrosByCidade(cidadeId!),
    queryFn: () => locationsService.getBairrosByCidade(cidadeId!),
    enabled: !!cidadeId,
    staleTime: 30 * 60 * 1000,
  })
}