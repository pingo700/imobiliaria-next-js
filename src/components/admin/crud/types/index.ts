import type { z } from 'zod'
import type { ColumnDef } from '@tanstack/react-table'

export interface BaseEntity {
  id: number
  [key: string]: any
}

export interface CrudConfig<TData extends BaseEntity, TSchema extends z.ZodTypeAny> {
  resource: string
  columns: ColumnDef<TData>[]
  schema: TSchema
  service: CrudService<TData>
  formatters?: Record<string, (value: any) => string>
  searchKeys?: (keyof TData)[]
  mapCreate?: (values: any) => any
  mapUpdate?: (values: any, item: TData) => any
  defaultSort?: { field: keyof TData; direction: 'asc' | 'desc' }
  labels?: {
    singular?: string
    plural?: string
    create?: string
    edit?: string
    delete?: string
  }
  hiddenColumns?: (keyof TData)[] | string[]
  actions?: CrudAction<TData>[]
  createHref?: string
  createButton?: React.ReactNode
}

export type MaybeApi<T> = T | ApiResponse<T>

export interface CrudService<TData> {
  getAll: () => Promise<MaybeApi<TData[]>>
  getById?: (id: number) => Promise<MaybeApi<TData>>
  create: (data: any) => Promise<ApiResponse<any>>
  update: (id: number, data: any) => Promise<ApiResponse<any>>
  delete: (id: number) => Promise<ApiResponse<any>>
}

export type BaseField = {
  name: string
  label: string
  placeholder?: string
  disabled?: boolean
}

export type TextFieldType = "text" | "number" | "email" | "password" | "tel" | "file"

export type TextField = BaseField & {
  type?: TextFieldType
}

export type SelectField = BaseField & {
  type: "select"
  options: { label: string; value: string }[]
}

export type FormField = TextField | SelectField

export interface ApiResponse<T = any> {
  status: 'success' | 'error'
  message?: string
  data?: T
}

export interface CrudState<TData> {
  data: TData[]
  loading: boolean
  error: string | null
  selectedItem: TData | null
  isCreateOpen: boolean
  isEditOpen: boolean
  isDeleteOpen: boolean
  deleteId: number | null
}

export interface CrudContextValue<TData extends BaseEntity, TSchema extends z.ZodTypeAny> {
  state: CrudState<TData>
  config: CrudConfig<TData, TSchema>
  actions: {
    refresh: () => Promise<void>
    openCreate: () => void
    openEdit: (item: TData) => void
    openDelete: (id: number) => void
    closeModals: () => void
    handleCreate: (data: any) => Promise<void>
    handleUpdate: (data: any) => Promise<void>
    handleDelete: () => Promise<void>
  }
}

export interface TableConfig<TData> {
  data: TData[]
  columns: ColumnDef<TData>[]
  loading?: boolean
  onEdit?: (item: TData) => void
  onDelete?: (id: number) => void
  formatters?: Record<string, (value: any) => string>
}

export interface ModalConfig {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
}

export interface CrudAction<TData extends BaseEntity> {
  id: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  type?: 'default' | 'destructive' | 'link'
  onClick?: (item: TData) => void
  href?: (item: TData) => string
  render?: (item: TData) => React.ReactNode
  visible?: (item: TData) => boolean
  disabled?: (item: TData) => boolean
}

export type CrudReducerAction<TData> = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_DATA'; payload: TData[] }
  | { type: 'SET_SELECTED'; payload: TData | null }
  | { type: 'OPEN_CREATE' }
  | { type: 'OPEN_EDIT'; payload: TData }
  | { type: 'OPEN_DELETE'; payload: number }
  | { type: 'CLOSE_MODALS' }
