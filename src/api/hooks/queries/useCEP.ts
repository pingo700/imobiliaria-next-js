"use client"

import { useQuery } from '@tanstack/react-query'
import { cepService } from '../../services/cep.service'
import { useState, useCallback } from 'react'

export function useCep() {
  const [cep, setCep] = useState('')
  
  const query = useQuery({
    queryKey: ['cep', cep],
    queryFn: () => cepService.search(cep),
    enabled: cepService.validateFormat(cep),
    staleTime: Infinity,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 1,
  })

  const searchCep = useCallback((newCep: string) => {
    setCep(newCep.replace(/\D/g, ''))
  }, [])

  return {
    ...query,
    searchCep,
    formatCep: cepService.formatCep,
    validateFormat: cepService.validateFormat,
  }
}