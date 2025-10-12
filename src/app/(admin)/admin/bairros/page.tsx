'use client'

import { createCrud, CrudHeader } from '@/components/admin/crud'
import type { ColumnDef } from '@tanstack/react-table'
import { locationsService, type Bairro, CreateBairroSchema, useCidades } from '@/api'

const { Crud } = createCrud<Bairro, typeof CreateBairroSchema>()

const columns: ColumnDef<Bairro>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Nome' },
  { accessorKey: 'cityName', header: 'Cidade' },
  { accessorKey: 'stateName', header: 'Estado' },
  { accessorKey: 'slug', header: 'Slug' },
]

const service = {
  getAll: locationsService.getBairros,
  create: locationsService.createBairro,
  update: async (id: number, data: any) => locationsService.createBairro({ bai_nome: String(data.bai_nome), cid_id: Number(data.cid_id) }),
  delete: locationsService.deleteBairro,
}

export default function Page() {
  const cidades = useCidades()
  const cidadeOptions = (cidades.data || []).map(c => ({
    label: `${c.name}${c.stateName ? ` - ${c.stateName}` : ''}`,
    value: c.id
  }))

  const fields = [
    { name: 'bai_nome', label: 'Nome' },
    { name: 'cid_id', label: 'Cidade', type: 'select', options: cidadeOptions },
  ] as const

  return (
    <Crud.Provider
      config={{
        resource: 'bairros',
        schema: CreateBairroSchema,
        service: service as any,
        columns,
        labels: { singular: 'Bairro', plural: 'Bairros', create: 'Adicionar Bairro' },
        searchKeys: ['name', 'cityName', 'stateName', 'slug']
      }}
    >
      <CrudHeader title="Bairros" subtitle="Catálogo de bairros" />
      <Crud.Table />
      <Crud.CreateModal fields={[...fields] as any} />
      <Crud.EditModal
        fields={[...fields] as any}
        getDefaultValues={(b) => ({ bai_nome: b.name, cid_id: b.cityId ?? undefined })}
      />
      <Crud.DeleteModal />
    </Crud.Provider>
  )
}
