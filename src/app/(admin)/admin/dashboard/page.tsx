'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Home, Users as UsersIcon, Building, Building2, MapPin, MapPinned, Plus, Loader2 } from 'lucide-react'
import { useProperties, useEstados, useCidades, useBairros, usersService, queryKeys } from '@/api'

export default function AdminDashboard() {
  const properties = useProperties()
  const estados = useEstados()
  const cidades = useCidades()
  const bairros = useBairros()
  const users = useQuery({ queryKey: queryKeys.users.all(), queryFn: usersService.getAll, staleTime: 300000 })

  const loading =
    properties.isLoading || estados.isLoading || cidades.isLoading || bairros.isLoading || users.isLoading

  const error =
    (properties.error as Error | null) ||
    (estados.error as Error | null) ||
    (cidades.error as Error | null) ||
    (bairros.error as Error | null) ||
    (users.error as Error | null)

  const counts = useMemo(
    () => ({
      properties: (properties.data || []).length,
      users: (users.data || []).length,
      estados: (estados.data || []).length,
      cidades: (cidades.data || []).length,
      bairros: (bairros.data || []).length,
    }),
    [properties.data, users.data, estados.data, cidades.data, bairros.data]
  )

  if (loading)
    return (
      <div className="container py-8 md:py-12 px-4 md:px-6">
        <div className="flex items-center justify-center h-64 gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando dashboard...</span>
        </div>
      </div>
    )

  if (error)
    return (
      <div className="container py-8 md:py-12 px-4 md:px-6">
        <div className="text-center space-y-4">
          <h2 className="text-lg font-semibold text-red-600">Erro</h2>
          <p className="text-muted-foreground">{error.message}</p>
          <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
        </div>
      </div>
    )

  return (
    <div className="container py-8 md:py-12 px-4 md:px-6">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
      </div>

      <div className="mb-4 grid gap-4 grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Imóveis</p>
                <h3 className="mt-1 text-2xl font-bold">{counts.properties}</h3>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <Building className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-4">
              <Link href="/admin/imoveis" className="text-sm text-primary hover:underline">
                Ver todos os imóveis
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Usuários</p>
                <h3 className="mt-1 text-2xl font-bold">{counts.users}</h3>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <UsersIcon className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-4">
              <Link href="/admin/usuarios" className="text-sm text-primary hover:underline">
                Ver todos os usuários
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Estados</p>
                <h3 className="mt-1 text-2xl font-bold">{counts.estados}</h3>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <MapPinned className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-4">
              <Link href="/admin/estados" className="text-sm text-primary hover:underline">
                Ver todos os Estados
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Cidades</p>
                <h3 className="mt-1 text-2xl font-bold">{counts.cidades}</h3>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-4">
              <Link href="/admin/cidades" className="text-sm text-primary hover:underline">
                Ver todas as Cidades
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Bairros</p>
                <h3 className="mt-1 text-2xl font-bold">{counts.bairros}</h3>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-4">
              <Link href="/admin/bairros" className="text-sm text-primary hover:underline">
                Ver todos os Bairros
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Link href="/admin/imoveis/new">
              <CardContent className="p-6 text-center">
                <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3 w-fit mx-auto mb-3">
                  <Plus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold">Novo Imóvel</h3>
                <p className="text-sm text-muted-foreground">Cadastrar novo imóvel</p>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Link href="/admin/usuarios">
              <CardContent className="p-6 text-center">
                <div className="rounded-full bg-green-100 dark:bg-green-900 p-3 w-fit mx-auto mb-3">
                  <UsersIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold">Gerenciar Usuários</h3>
                <p className="text-sm text-muted-foreground">Adicionar ou editar usuários</p>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Link href="/admin/estados">
              <CardContent className="p-6 text-center">
                <div className="rounded-full bg-purple-100 dark:bg-purple-900 p-3 w-fit mx-auto mb-3">
                  <MapPinned className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold">Localização</h3>
                <p className="text-sm text-muted-foreground">Gerenciar estados, cidades e bairros</p>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Link href="/imoveis">
              <CardContent className="p-6 text-center">
                <div className="rounded-full bg-orange-100 dark:bg-orange-900 p-3 w-fit mx-auto mb-3">
                  <Home className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="font-semibold">Ver Site</h3>
                <p className="text-sm text-muted-foreground">Visualizar site público</p>
              </CardContent>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  )
}
