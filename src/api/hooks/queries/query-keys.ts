export const qk = {
  owners: {
    all: ['owners'] as const,
    list: (params?: unknown) => ['owners', 'list', params ?? {}] as const,
    byId: (id: number | string) => ['owners', 'byId', id] as const,
  },
  properties: {
    all: ['properties'] as const,
    list: (params?: unknown) => ['properties', 'list', params ?? {}] as const,
    byId: (id: number | string) => ['properties', 'byId', id] as const,
  },
  locations: {
    estados: ['locations', 'estados'] as const,
    cidades: (estado?: string) => ['locations', 'cidades', estado ?? ''] as const,
    bairros: (cidade?: string) => ['locations', 'bairros', cidade ?? ''] as const,
  },
}
