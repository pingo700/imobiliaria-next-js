'use client'

import type { ReactNode, CSSProperties } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FooterAdmin } from '@/components/admin/footer'
import { ModeToggle } from '@/components/theme-toggle'
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar'
import { AdminSidebar } from '@/components/admin/sidebar'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { UserDropdown } from '@/components/public/user-dropdown'

type LayoutAdminProps = { children: ReactNode }

const formatSegment = (segment: string) => {
  const map: Record<string, string> = {
    admin: 'Administração',
    imoveis: 'Imóveis',
    users: 'Usuários',
    dashboard: 'Dashboard',
    settings: 'Configurações',
    profile: 'Perfil',
    proprietarios: 'Proprietários',
    bairros: 'Bairros',
    cidades: 'Cidades',
    estados: 'Estados',
  }
  return map[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
}

export function LayoutAdmin({ children }: LayoutAdminProps) {
  const pathname = usePathname()

  const breadcrumbs = (() => {
    const segs = pathname.split('/').filter(Boolean)
    if (segs.length === 0) return [{ label: 'Home', href: '/', isActive: true }]
    let acc = ''
    return segs.map((s, i) => {
      acc += `/${s}`
      return { label: formatSegment(s), href: acc, isActive: i === segs.length - 1 }
    })
  })()

  const vars = {
    '--sidebar-width': '20rem',
    '--sidebar-width-mobile': '22rem',
    '--sidebar-width-icon': '4rem',
  } as CSSProperties

  return (
    <div className="flex flex-col min-h-screen">
      <SidebarProvider defaultOpen style={vars}>
        <AdminSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((b, i) => (
                  <div key={b.href} className="flex items-center">
                    {i > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      {b.isActive ? (
                        <BreadcrumbPage>{b.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link href={b.href}>{b.label}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
            <div className="ml-auto flex flex-row gap-2 items-center">
              <ModeToggle />
              <UserDropdown />
            </div>
          </header>

          <main className="flex-1 flex flex-col">
            <div className="flex-1 p-4">{children}</div>
            <FooterAdmin />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
