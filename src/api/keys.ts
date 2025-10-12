export const queryKeys = {
  all: ["api"] as const,
  auth: {
    all: () => [...queryKeys.all, "auth"] as const,
    user: () => [...queryKeys.auth.all(), "user"] as const,
  },
  properties: {
    all: () => [...queryKeys.all, "properties"] as const,
    lists: () => [...queryKeys.properties.all(), "list"] as const,
    list: (filters?: unknown) => [...queryKeys.properties.lists(), { filters: filters ?? {} }] as const,
    details: () => [...queryKeys.properties.all(), "detail"] as const,
    detail: (id: number) => [...queryKeys.properties.details(), id] as const,
    search: (params: any) => [...queryKeys.properties.all(), "search", params] as const,
  },
  owners: {
    all: () => [...queryKeys.all, "owners"] as const,
    lists: () => [...queryKeys.owners.all(), "list"] as const,
    list: () => [...queryKeys.owners.lists()] as const,
    details: () => [...queryKeys.owners.all(), "detail"] as const,
    detail: (id: number) => [...queryKeys.owners.details(), id] as const,
    search: (q: string) => [...queryKeys.owners.all(), "search", q] as const,
  },
  users: {
    all: () => [...queryKeys.all, "users"] as const,
    lists: () => [...queryKeys.users.all(), "list"] as const,
    list: () => [...queryKeys.users.lists()] as const,
    details: () => [...queryKeys.users.all(), "detail"] as const,
    detail: (id: number) => [...queryKeys.users.details(), id] as const,
  },
  locations: {
    all: () => [...queryKeys.all, "locations"] as const,
    estados: () => [...queryKeys.locations.all(), "estados"] as const,
    cidades: () => [...queryKeys.locations.all(), "cidades"] as const,
    cidadesByEstado: (estadoId: number) => [...queryKeys.locations.cidades(), estadoId] as const,
    bairros: () => [...queryKeys.locations.all(), "bairros"] as const,
    bairrosByCidade: (cidadeId: number) => [...queryKeys.locations.bairros(), cidadeId] as const,
  },
}

export const properties = queryKeys.properties
export const owners = queryKeys.owners
export const users = queryKeys.users
export const locations = queryKeys.locations
export const auth = queryKeys.auth
