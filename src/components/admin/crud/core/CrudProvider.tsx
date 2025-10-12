'use client'

import { createContext, useContext, useReducer, useCallback, useEffect, type ReactNode } from 'react'
import type { z } from 'zod'
import { toast } from 'sonner'
import type { CrudConfig, CrudState, CrudContextValue, CrudReducerAction, BaseEntity } from '../types'

function createCrudContext<TData extends BaseEntity, TSchema extends z.ZodTypeAny>() {
  return createContext<CrudContextValue<TData, TSchema> | undefined>(undefined)
}

function crudReducer<TData extends BaseEntity>(
  state: CrudState<TData>,
  action: CrudReducerAction<TData>
): CrudState<TData> {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    case 'SET_DATA':
      return { ...state, data: action.payload, loading: false, error: null }
    case 'SET_SELECTED':
      return { ...state, selectedItem: action.payload }
    case 'OPEN_CREATE':
      return { ...state, isCreateOpen: true, selectedItem: null }
    case 'OPEN_EDIT':
      return { ...state, isEditOpen: true, selectedItem: action.payload }
    case 'OPEN_DELETE':
      return { ...state, isDeleteOpen: true, deleteId: action.payload }
    case 'CLOSE_MODALS':
      return {
        ...state,
        isCreateOpen: false,
        isEditOpen: false,
        isDeleteOpen: false,
        selectedItem: null,
        deleteId: null
      }
    default:
      return state
  }
}

interface CrudProviderProps<TData extends BaseEntity, TSchema extends z.ZodTypeAny> {
  config: CrudConfig<TData, TSchema>
  children: ReactNode
}

export function createCrudProvider<TData extends BaseEntity, TSchema extends z.ZodTypeAny>() {
  const Context = createCrudContext<TData, TSchema>()

  function CrudProvider({ config, children }: CrudProviderProps<TData, TSchema>) {
    const initialState: CrudState<TData> = {
      data: [],
      loading: true,
      error: null,
      selectedItem: null,
      isCreateOpen: false,
      isEditOpen: false,
      isDeleteOpen: false,
      deleteId: null
    }

    const [state, dispatch] = useReducer(
      crudReducer as React.Reducer<CrudState<TData>, CrudReducerAction<TData>>,
      initialState
    )

    const refresh = useCallback(async () => {
      dispatch({ type: 'SET_LOADING', payload: true })
      try {
        const response = await config.service.getAll()
        const items = Array.isArray(response) ? response : (response.data ?? [])
        dispatch({ type: 'SET_DATA', payload: items })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro desconhecido'
        dispatch({ type: 'SET_ERROR', payload: message })
        toast.error(message)
      }
    }, [config.service])

    const handleCreate = useCallback(async (data: any) => {
      try {
        const response = await config.service.create(data)
        if ((response as any).status === 'success') {
          toast.success(`${config.labels?.singular || 'Item'} criado com sucesso`)
          dispatch({ type: 'CLOSE_MODALS' })
          await refresh()
        } else {
          throw new Error((response as any)?.message || 'Erro ao criar')
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao criar'
        toast.error(message)
        throw error
      }
    }, [config, refresh])

    const handleUpdate = useCallback(async (data: any) => {
      if (!state.selectedItem?.id) return
      try {
        const response = await config.service.update(state.selectedItem.id, data)
        if ((response as any).status === 'success') {
          toast.success(`${config.labels?.singular || 'Item'} atualizado com sucesso`)
          dispatch({ type: 'CLOSE_MODALS' })
          await refresh()
        } else {
          throw new Error((response as any)?.message || 'Erro ao atualizar')
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao atualizar'
        toast.error(message)
        throw error
      }
    }, [config, state.selectedItem, refresh])

    const handleDelete = useCallback(async () => {
      if (!state.deleteId) return
      try {
        const response = await config.service.delete(state.deleteId)
        if ((response as any).status === 'success') {
          toast.success(`${config.labels?.singular || 'Item'} excluído com sucesso`)
          dispatch({ type: 'CLOSE_MODALS' })
          await refresh()
        } else {
          throw new Error((response as any)?.message || 'Erro ao excluir')
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao excluir'
        toast.error(message)
      }
    }, [config, state.deleteId, refresh])

    useEffect(() => {
      refresh()
    }, [refresh])

    const value: CrudContextValue<TData, TSchema> = {
      state,
      config,
      actions: {
        refresh,
        openCreate: () => dispatch({ type: 'OPEN_CREATE' }),
        openEdit: (item) => dispatch({ type: 'OPEN_EDIT', payload: item }),
        openDelete: (id) => dispatch({ type: 'OPEN_DELETE', payload: id }),
        closeModals: () => dispatch({ type: 'CLOSE_MODALS' }),
        handleCreate,
        handleUpdate,
        handleDelete
      }
    }
    return <Context.Provider value={value}>{children}</Context.Provider>
  }

  function useCrud() {
    const context = useContext(Context)
    if (!context) {
      throw new Error('useCrud must be used within CrudProvider')
    }
    return context
  }

  return { CrudProvider, useCrud }
}
