'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  User,
  Building,
  Globe,
  Building2,
  MapPin,
  MapPinned,
  UserCog
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

export function AdminSidebar() {
  const { state } = useSidebar()
  const pathname = usePathname()

  const navItems = [
    { icon: Home, name: 'Dashboard', href: '/admin/dashboard' },
    { icon: Building, name: 'Imóveis', href: '/admin/imoveis' },
    { icon: UserCog, name: 'Proprietários', href: '/admin/proprietarios' },
    { icon: User, name: 'Usuários', href: '/admin/usuarios' },
    { icon: MapPin, name: 'Bairros', href: '/admin/bairros' },
    { icon: Building2, name: 'Cidades', href: '/admin/cidades' },
    { icon: MapPinned, name: 'Estados', href: '/admin/estados' },
  ] as const

  const isActive = (href: string) =>
    pathname === href || (href !== '/admin' && pathname.startsWith(href + '/'))

  return (
    <Sidebar collapsible="icon" className="border-r border-border/40 bg-sidebar">
      <SidebarHeader>
        <div className="flex h-16 items-center justify-center px-4 py-2">
          <Link href="/admin" className="flex items-center justify-center">
            {state === 'expanded' ? (
              <img src="/logo.svg" alt="Logo" className="h-14 w-auto max-w-[180px]" />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center">
                <img src="/favicon.svg" alt="Logo" className="h-6 w-6" />
              </div>
            )}
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4 space-y-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
            Administração
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.name}
                    className="h-10 px-3 rounded-lg group-data-[collapsible=icon]:h-11 group-data-[collapsible=icon]:w-11 group-data-[collapsible=icon]:p-0"
                  >
                    <Link href={item.href} className="flex items-center gap-3 w-full">
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="font-medium truncate">{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
            Site
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Ver Site"
                  className="h-10 px-3 rounded-lg group-data-[collapsible=icon]:h-11 group-data-[collapsible=icon]:w-11 group-data-[collapsible=icon]:p-0"
                >
                  <Link href="/" className="flex items-center gap-3 w-full">
                    <Globe className="h-4 w-4 shrink-0" />
                    <span className="font-medium truncate">Ver Site</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
