"use client"

import { useQuery, type UseQueryResult } from "@tanstack/react-query"
import { queryKeys } from "../../keys"
import type { Property } from "../../schemas/property"
import { propertiesService } from "../../services/properties.service"

type UsePropertyOptions = {
  enabled?: boolean
  staleTime?: number
  retry?: number
}

async function fetchProperty(id: number): Promise<Property> {
  return propertiesService.getById(id)
}

export function useProperties() {
  return useQuery({
    queryKey: queryKeys.properties.lists(),
    queryFn: propertiesService.getAll,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useProperty(id: number): UseQueryResult<Property, unknown>
export function useProperty(id: number | null | undefined, options?: UsePropertyOptions): UseQueryResult<Property, unknown>
export function useProperty(id: number | null | undefined, options: UsePropertyOptions = {}) {
  const enabled = options.enabled ?? (typeof id === "number" && id > 0)
  const safeId = typeof id === "number" && id > 0 ? id : 0
  return useQuery<Property>({
    queryKey: queryKeys.properties.detail(safeId),
    queryFn: () => fetchProperty(safeId),
    enabled,
    staleTime: options.staleTime ?? 60_000,
    retry: options.retry ?? 1,
  })
}

export function usePropertyBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["property", "slug", slug],
    queryFn: () => propertiesService.getBySlug(slug!),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  })
}

export function usePropertySearch(params: {
  query?: string
  categoria?: string
  preco_min?: number
  preco_max?: number
  estado_id?: number
  cidade_id?: number
  bai_id?: number
  quartos_min?: number
}) {
  return useQuery({
    queryKey: queryKeys.properties.search(params),
    queryFn: () => propertiesService.search(params),
    staleTime: 2 * 60 * 1000,
  })
}

export function usePublicProperties(limit?: number) {
  return useQuery({
    queryKey: ["public-properties", { limit }],
    queryFn: async () => {
      const list = await propertiesService.getPublic()
      return limit ? list.slice(0, limit) : list
    },
    staleTime: 5 * 60 * 1000,
  })
}
