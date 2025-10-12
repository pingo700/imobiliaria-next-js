'use client'

import { createCrud, formatters, CrudHeader } from '@/components/admin/crud'
import type { ColumnDef } from '@tanstack/react-table'
import { usersService, type User } from '@/api'
import { z } from 'zod'

const UserFormSchema = z.object({
  usu_nome: z.string().min(1, 'Nome é obrigatório'),
  usu_email: z.string().email('E-mail inválido'),
  usu_senha: z.string().min(1, 'Senha é obrigatória').optional(),
  usu_foto: z.any().optional(),
})

const { Crud } = createCrud<User, typeof UserFormSchema> ()

const columns: ColumnDef<User>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Nome' },
  { accessorKey: 'email', header: 'E-mail' },
  { accessorKey: 'createdAt', header: 'Criado em', cell: ({ getValue }) => formatters.dateTime(String(getValue() || '')) },
]

const service = {
  getAll: usersService.getAll,
  create: usersService.create,
  update: usersService.update,
  delete: usersService.delete,
}

const fieldsCreate = [
  { name: 'usu_nome', label: 'Nome' },
  { name: 'usu_email', label: 'E-mail', type: 'email' },
  { name: 'usu_senha', label: 'Senha', type: 'password' },
  { name: 'usu_foto', label: 'Foto', type: 'file' },
] as const

const fieldsEdit = [
  { name: 'usu_nome', label: 'Nome' },
  { name: 'usu_email', label: 'E-mail', type: 'email' },
  { name: 'usu_senha', label: 'Senha', type: 'password', placeholder: 'Opcional' },
  { name: 'usu_foto', label: 'Foto', type: 'file' },
] as const

export default function Page() {
  return (
    <Crud.Provider
      config={{
        resource: 'usuarios',
        schema: UserFormSchema,
        service: service as any,
        columns,
        labels: { singular: 'Usuário', plural: 'Usuários', create: 'Adicionar Usuário' },
        searchKeys: ['name', 'email']
      }}
    >
      <CrudHeader title="Usuários" subtitle="Controle de acesso e gestão de usuários" />
      <Crud.Table />
      <Crud.CreateModal fields={[...fieldsCreate] as any} />
      <Crud.EditModal
        fields={[...fieldsEdit] as any}
        getDefaultValues={(u) => ({
          usu_nome: u.name,
          usu_email: u.email,
        })}
      />
      <Crud.DeleteModal />
    </Crud.Provider>
  )
}
