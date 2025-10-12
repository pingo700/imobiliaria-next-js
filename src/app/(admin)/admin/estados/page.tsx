'use client'

import { createCrud, CrudHeader } from '@/components/admin/crud'
import type { ColumnDef } from '@tanstack/react-table'
import { locationsService, type Estado, CreateEstadoSchema } from '@/api'

const { Crud } = createCrud<Estado, typeof CreateEstadoSchema>()

const columns: ColumnDef<Estado>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Nome' },
  { accessorKey: 'slug', header: 'Slug' },
]

const service = {
  getAll: locationsService.getEstados,
  create: locationsService.createEstado,
  update: async (id: number, data: any) => locationsService.createEstado({ est_nome: String(data.est_nome) }),
  delete: locationsService.deleteEstado,
}

const fields = [
  { name: 'est_nome', label: 'Nome' },
] as const

export default function Page() {
  return (
    <Crud.Provider
      config={{
        resource: 'estados',
        schema: CreateEstadoSchema,
        service: service as any,
        columns,
        labels: { singular: 'Estado', plural: 'Estados', create: 'Adicionar Estado' },
        searchKeys: ['name', 'slug']
      }}
    >
      <CrudHeader title="Estados" subtitle="Catálogo de estados" />
      <Crud.Table />
      <Crud.CreateModal fields={[...fields] as any} />
      <Crud.EditModal
        fields={[...fields] as any}
        getDefaultValues={(e) => ({ est_nome: e.name })}
      />
      <Crud.DeleteModal />
    </Crud.Provider>
  )
}
