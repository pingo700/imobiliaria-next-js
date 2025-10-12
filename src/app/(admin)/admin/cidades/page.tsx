'use client'

import { createCrud, CrudHeader } from '@/components/admin/crud'
import type { ColumnDef } from '@tanstack/react-table'
import { locationsService, type Cidade, CreateCidadeSchema, useEstados } from '@/api'

const { Crud } = createCrud<Cidade, typeof CreateCidadeSchema>()

const columns: ColumnDef<Cidade>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Nome' },
  { accessorKey: 'stateName', header: 'Estado' },
  { accessorKey: 'slug', header: 'Slug' },
]

const service = {
  getAll: locationsService.getCidades,
  create: locationsService.createCidade,
  update: async (id: number, data: any) => locationsService.createCidade({ cid_nome: String(data.cid_nome), est_id: Number(data.est_id) }),
  delete: locationsService.deleteCidade,
}

export default function Page() {
  const estados = useEstados()
  const estadoOptions = (estados.data || []).map(e => ({ label: e.name, value: String(e.id) }))

  const fields = [
    { name: 'cid_nome', label: 'Nome' },
    { name: 'est_id', label: 'Estado', type: 'select', options: estadoOptions },
  ] as const

  return (
    <Crud.Provider
      config={{
        resource: 'cidades',
        schema: CreateCidadeSchema,
        service: service as any,
        columns,
        labels: { singular: 'Cidade', plural: 'Cidades', create: 'Adicionar Cidade' },
        searchKeys: ['name', 'stateName', 'slug']
      }}
    >
      <CrudHeader title="Cidades" subtitle="Catálogo de cidades" />
      <Crud.Table />
      <Crud.CreateModal fields={[...fields] as any} />
      <Crud.EditModal
        fields={[...fields] as any}
        getDefaultValues={(c) => ({ cid_nome: c.name, est_id: c.stateId ?? undefined })}
      />
      <Crud.DeleteModal />
    </Crud.Provider>
  )
}
