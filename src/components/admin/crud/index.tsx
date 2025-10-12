import type { z, ZodTypeAny } from 'zod'
import type { FieldValues, DefaultValues } from 'react-hook-form'
import { CrudTable } from './core/CrudTable'
import { CrudForm, type FormField } from './core/CrudForm'
import { CrudModal } from './core/CrudModal'
import { createCrudProvider } from './core/CrudProvider'
import type { BaseEntity } from './types'
import type { ColumnDef } from '@tanstack/react-table'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { AlertTriangle } from 'lucide-react'

export function createCrud<TData extends BaseEntity, TSchema extends ZodTypeAny>() {
  type TValues = z.infer<TSchema> & FieldValues
  const { CrudProvider, useCrud } = createCrudProvider<TData, TSchema>()

  function Crud({ children }: { children: React.ReactNode }) {
    return <>{children}</>
  }

  function Table(props: { className?: string }) {
    const { state, config, actions } = useCrud()
    return (
      <div className={props.className}>
        <CrudTable<TData>
          data={state.data}
          columns={config.columns as ColumnDef<TData, any>[]}
          loading={state.loading}
          onRefresh={actions.refresh}
          onCreate={!config.createHref && !config.createButton ? actions.openCreate : undefined}
          onEdit={actions.openEdit}
          onDelete={(id) => actions.openDelete(id)}
          labels={config.labels}
          formatters={config.formatters}
          searchKeys={config.searchKeys}
          hiddenColumns={config.hiddenColumns}
          customActions={config.actions || []}
          createHref={config.createHref}
          createButton={config.createButton}
        />
      </div>
    )
  }

  function CreateModal({ fields, defaultValues }: { fields: FormField<TValues>[]; defaultValues?: DefaultValues<TValues> }) {
    const { state, config, actions } = useCrud()
    return (
      <CrudModal
        isOpen={state.isCreateOpen}
        onClose={actions.closeModals}
        title={config.labels?.create || `Criar ${config.labels?.singular || 'Item'}`}
      >
        <CrudForm
          schema={config.schema as TSchema}
          onSubmit={actions.handleCreate as (d: TValues) => Promise<void>}
          defaultValues={defaultValues}
          fields={fields}
          submitLabel="Criar"
          onCancel={actions.closeModals}
        />
      </CrudModal>
    )
  }

  function EditModal({ fields, getDefaultValues }: { fields: FormField<TValues>[]; getDefaultValues?: (item: TData) => DefaultValues<TValues> }) {
    const { state, config, actions } = useCrud()
    const dv = state.selectedItem && getDefaultValues ? getDefaultValues(state.selectedItem) : (state.selectedItem as unknown as DefaultValues<TValues>)
    return (
      <CrudModal
        isOpen={state.isEditOpen}
        onClose={actions.closeModals}
        title={config.labels?.edit || `Editar ${config.labels?.singular || 'Item'}`}
      >
        <CrudForm
          schema={config.schema as TSchema}
          onSubmit={actions.handleUpdate as (d: TValues) => Promise<void>}
          defaultValues={dv}
          fields={fields}
          submitLabel="Atualizar"
          onCancel={actions.closeModals}
        />
      </CrudModal>
    )
  }

  function DeleteModal() {
    const { state, config, actions } = useCrud()
    const [isDeleting, setIsDeleting] = useState(false)

    const name = config.labels?.singular || 'item'
    const item =
      (state.deleteId ? state.data.find(d => d.id === state.deleteId) : null) ||
      state.selectedItem ||
      null

    const itemLabel =
      (item?.name ?? item?.title ?? (item as any)?.imo_nome ?? (item as any)?.prp_nome ?? null) ||
      (state.deleteId ? `ID ${state.deleteId}` : '')

    const onConfirm = async () => {
      if (isDeleting) return
      setIsDeleting(true)
      try {
        await actions.handleDelete()
      } finally {
        setIsDeleting(false)
      }
    }

    return (
      <CrudModal
        isOpen={state.isDeleteOpen}
        onClose={actions.closeModals}
        title="Confirmar Exclusão"
        description={`Esta ação não pode ser desfeita. Isso excluirá permanentemente o ${name} selecionado.`}
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-destructive" />
          <div className="space-y-1">
            <p className="text-sm">
              Tem certeza que deseja excluir {name.toLowerCase()}
              {itemLabel ? ` “${String(itemLabel)}”` : ''}?
            </p>
            {state.deleteId ? (
              <p className="text-xs text-muted-foreground">ID: {state.deleteId}</p>
            ) : null}
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={actions.closeModals} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogFooter>
      </CrudModal>
    )
  }

  Crud.Provider = CrudProvider
  Crud.Table = Table
  Crud.CreateModal = CreateModal
  Crud.EditModal = EditModal
  Crud.DeleteModal = DeleteModal

  return { Crud, useCrud, CrudProvider }
}

export { formatters, parsers } from './utils/formatters'
export { CrudHeader } from './core/CrudTable'
export type { CrudConfig, CrudService, ApiResponse, BaseEntity, CrudAction } from './types'
export type { FormField } from './core/CrudForm'
