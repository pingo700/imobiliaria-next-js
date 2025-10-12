export { apiClient, ApiError } from './core/client'

export { authService } from './services/auth.service'
export { propertiesService } from './services/properties.service'
export { ownersService } from './services/owners.service'
export { locationsService } from './services/locations.service'
export { usersService } from './services/users.service'
export { cepService } from './services/cep.service'

export * from './hooks/queries/useProperties'
export * from './hooks/queries/useLocations'
export { useCep } from './hooks/queries/useCEP'

export * from './hooks/mutations/usePropertyMutations'
export * from './hooks/mutations/useAuthMutations'
export { usePropertyForm } from './hooks/forms/usePropertyForm'

export { queryKeys } from './keys'

export {
  PropertyFormDataSchema,
  type Property,
  type PropertyFormData
} from './schemas/property'

export {
  CreateOwnerSchema,
  OwnerSchema,
  type Owner,
  type CreateOwnerData
} from './schemas/owner'

export {
  EstadoSchema,
  CidadeSchema,
  BairroSchema,
  CreateEstadoSchema,
  CreateCidadeSchema,
  CreateBairroSchema,
  type Estado,
  type Cidade,
  type Bairro
} from './schemas/location'

export {
  LoginRequestSchema,
  LoginResponseSchema,
  type User,
  type LoginRequest,
  type LoginResponse
} from './schemas/user'

export {
  ApiResponseSchema,
  PaginatedResponseSchema,
  type ApiResponse,
  type PaginatedResponse
} from './schemas/common'

export type { CepData } from './services/cep.service'
