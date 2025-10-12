'use client'
import { createCrud, formatters, CrudHeader } from '@/components/admin/crud'
import type { ColumnDef } from '@tanstack/react-table'
import { propertiesService, PropertyFormDataSchema, type Property, type PropertyFormData } from '@/api'

const { Crud } = createCrud<Property, typeof PropertyFormDataSchema>()

const columns: ColumnDef<Property>[] = [
  { accessorKey: 'name', header: 'Título' },
  { accessorKey: 'category', header: 'Tipo' },
  { accessorKey: 'ownerName', header: 'Proprietário' },
  { accessorKey: 'price', header: 'Preço', cell: ({ getValue }) => formatters.currency(Number(getValue() || 0)) },
  {
    id: 'local',
    header: 'Local',
    cell: ({ row }) => {
      const l = row.original.location || { state: '', city: '', neighborhood: '' }
      return [l.city, l.state, l.neighborhood].filter(Boolean).join(' / ') || '-'
    }
  },
  { accessorKey: 'updatedAt', header: 'Atualizado em', cell: ({ getValue }) => formatters.dateTime(String(getValue() || '')) },
]

const service = {
  getAll: propertiesService.getAll,
  create: async (data: PropertyFormData) => {
    const fd = propertiesService.createFormData(data)
    const resp = await propertiesService.create(fd)
    return { status: 'success', data: resp } as any
  },
  update: async (id: number, data: PropertyFormData) => {
    const fd = propertiesService.createFormData(data)
    const resp = await propertiesService.update(id, fd)
    return { status: 'success', data: resp } as any
  },
  delete: async (id: number) => {
    const resp = await propertiesService.delete(id)
    return { status: 'success', data: resp } as any
  },
}

const fields = [
  { name: 'title', label: 'Título' },
  { name: 'type', label: 'Tipo', type: 'select', options: [
    { label: 'Casa', value: 'Casa' },
    { label: 'Apartamento', value: 'Apartamento' },
    { label: 'Terreno', value: 'Terreno' },
    { label: 'Comercial', value: 'Comercial' },
  ]},
  { name: 'price', label: 'Preço (centavos, só dígitos)', parser: (v: string) => v.replace(/\D/g, '') },
  { name: 'address', label: 'Endereço' },
  { name: 'zipCode', label: 'CEP' },
  { name: 'estado_nome', label: 'Estado' },
  { name: 'cidade_nome', label: 'Cidade' },
  { name: 'bairro_nome', label: 'Bairro' },
  { name: 'imd_status', label: 'Status' },
] as const

export default function Page() {
  return (
    <Crud.Provider
      config={{
        resource: 'imoveis',
        schema: PropertyFormDataSchema,
        service: service as any,
        columns,
        labels: { singular: 'Imóvel', plural: 'Imóveis' },
        searchKeys: ['name', 'category', 'address', 'ownerName', 'zipCode', 'condominium'],
        createHref: '/admin/imoveis/cadastrar'
      }}
    >
      <CrudHeader title="Imóveis" subtitle="Cadastro e manutenção do portfólio" />
      <Crud.Table />
      <Crud.CreateModal fields={[...fields] as any} />
      <Crud.EditModal
        fields={[...fields] as any}
        getDefaultValues={(p) => ({
          title: p.name || '',
          type: p.category,
          price: String(p.price || ''),
          address: p.address || '',
          zipCode: p.zipCode || '',
          estado_nome: p.location?.state || '',
          cidade_nome: p.location?.city || '',
          bairro_nome: p.location?.neighborhood || '',
          imd_status: p.details?.status || 'À venda',
        })}
      />
      <Crud.DeleteModal />
    </Crud.Provider>
  )
}
