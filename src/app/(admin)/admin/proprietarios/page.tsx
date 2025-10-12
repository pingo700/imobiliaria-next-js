'use client'

import { createCrud, formatters, CrudHeader } from '@/components/admin/crud'
import type { ColumnDef } from '@tanstack/react-table'
import { ownersService, type Owner, CreateOwnerSchema } from '@/api'

const { Crud } = createCrud<Owner, typeof CreateOwnerSchema>()

const columns: ColumnDef<Owner>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Nome' },
  { accessorKey: 'document', header: 'Documento' },
  { accessorKey: 'email', header: 'E-mail' },
  { accessorKey: 'phone', header: 'Telefone', cell: ({ getValue }) => formatters.phone(String(getValue() || '')) },
  { accessorKey: 'createdAt', header: 'Criado em', cell: ({ getValue }) => formatters.dateTime(String(getValue() || '')) },
]

const service = {
  getAll: ownersService.getAll,
  create: ownersService.create,
  update: ownersService.update,
  delete: ownersService.delete,
}

const fields = [
  { name: 'prp_nome', label: 'Nome' },
  { name: 'prp_documento', label: 'Documento' },
  { name: 'prp_email', label: 'E-mail', type: 'email' },
  { name: 'prp_telefone', label: 'Telefone', type: 'tel' },
] as const

export default function Page() {
  return (
    <Crud.Provider
      config={{
        resource: 'proprietarios',
        schema: CreateOwnerSchema,
        service: service as any,
        columns,
        labels: { singular: 'Proprietário', plural: 'Proprietários', create: 'Adicionar Proprietário' },
        searchKeys: ['name', 'email', 'phone']
      }}
    >
      <CrudHeader title="Proprietários" subtitle="Gerencie os proprietários do sistema" />
      <Crud.Table />
      <Crud.CreateModal fields={[...fields] as any} />
      <Crud.EditModal
        fields={[...fields] as any}
        getDefaultValues={(o) => ({
          prp_nome: o.name,
          prp_documento: o.document || '',
          prp_email: o.email || '',
          prp_telefone: o.phone || '',
        })}
      />
      <Crud.DeleteModal />
    </Crud.Provider>
  )
}
