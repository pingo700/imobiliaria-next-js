'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Menu, X, Home, User, LogOut, Settings, HelpCircle, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { ModeToggle } from '@/components/theme-toggle'
import { useLogout } from '@/api/hooks/mutations/useAuthMutations'
import { authService } from '@/api'
import { UserDropdown } from '@/components/public/user-dropdown'

function useMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

function getImageUrl(fotoPath?: string | null) {
  if (!fotoPath) return null
  if (/^https?:\/\//i.test(fotoPath)) return fotoPath
  return `https://Sistemaimobiliariavga.com.br/public/${fotoPath}`
}

type UserShape = { nome?: string; email?: string; foto?: string | null }

type BaseLink = { name: string; icon?: LucideIcon }
type NavLink = BaseLink & ({ href: string; external?: boolean; onClick?: never } | { onClick: () => void; href?: never })

export function Navbar() {
  const pathname = usePathname() || '/'
  const isMobile = useMobile()
  const [isOpen, setIsOpen] = useState(false)
  const { mutateAsync: doLogout } = useLogout()

  const [user, setUser] = useState<UserShape | null>(null)
  useEffect(() => {
    setUser(authService.getCurrentUser())
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'user_data') setUser(authService.getCurrentUser())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const isAuthenticated = !!user
  const isAdmin = pathname.startsWith('/admin')

  const userData = useMemo(() => {
    const name = user?.nome || 'Usuário'
    const avatarUrl = getImageUrl((user as any)?.foto) || null
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'
    const email = (user as any)?.email || ''
    return { name, avatarUrl, initials, email }
  }, [user])

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const navLinks: NavLink[] = [
    { name: 'Home', href: '/' },
    { name: 'Imóveis', href: '/imoveis' },
    { name: 'Contato', href: 'https://wa.me/Sistema', external: true },
    { name: 'Sobre', onClick: () => scrollToSection('sobre') },
    { name: 'FAQs', href: '/faq' },
  ]

  const adminLinks: NavLink[] = [
    { icon: Home, name: 'Dashboard', href: '/admin/dashboard' },
    { icon: Building2, name: 'Imóveis', href: '/admin/imoveis' },
    { icon: User, name: 'Usuários', href: '/admin/usuarios' },
  ]

  const links = isAdmin ? adminLinks : navLinks

  const renderNavLink = (link: NavLink) => {
    if ('onClick' in link && typeof link.onClick === 'function') {
      return (
        <button
          key={link.name}
          onClick={() => {
            link.onClick?.()
            setIsOpen(false)
          }}
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary flex items-center gap-2',
            'text-muted-foreground hover:text-primary'
          )}
        >
          {'icon' in link && link.icon ? <link.icon className="h-4 w-4" /> : null}
          {link.name}
        </button>
      )
    }

    if ('external' in link && link.external) {
      return (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary flex items-center gap-2',
            'text-muted-foreground hover:text-primary'
          )}
          onClick={() => setIsOpen(false)}
        >
          {'icon' in link && link.icon ? <link.icon className="h-4 w-4" /> : null}
          {link.name}
        </a>
      )
    }

    return (
      <Link
        key={link.href}
        href={link.href}
        className={cn(
          'text-sm font-medium transition-colors hover:text-primary flex items-center gap-2',
          pathname === link.href ? 'text-primary' : 'text-muted-foreground'
        )}
        onClick={() => setIsOpen(false)}
      >
        {'icon' in link && link.icon ? <link.icon className="h-4 w-4" /> : null}
        {link.name}
      </Link>
    )
  }

  const handleSignOut = async () => {
    try {
      await doLogout()
      setUser(null)
    } catch {}
  }

  return (
    <header className="margin-web border-grid sticky h-20 top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex flex-row justify-between items-center transition-transform duration-300">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center space-x-2">
          <img src="/logo.svg" alt="" className="mr-5 w-46" />
        </Link>

        {isMobile ? (
          <>
            <div className="flex items-center space-x-2">
              <ModeToggle />
              {isAdmin && isAuthenticated && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userData.avatarUrl ?? undefined} alt={userData.name} />
                  <AvatarFallback>{userData.initials}</AvatarFallback>
                </Avatar>
              )}
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(v => !v)}>
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>

            <div
              className={cn(
                'absolute left-0 top-20 z-50 w-full bg-background p-4 shadow-md border-b transition-all duration-300 ease-in-out',
                isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
              )}
            >
              <nav className="flex flex-col space-y-4">
                {isAdmin && isAuthenticated && (
                  <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg mb-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={userData.avatarUrl ?? undefined} alt={userData.name} />
                      <AvatarFallback>{userData.initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{userData.name}</span>
                      <span className="text-xs text-muted-foreground">{userData.email}</span>
                    </div>
                  </div>
                )}

                {links.map(renderNavLink)}

                {!isAdmin && (
                  <div className="flex flex-col space-y-2 pt-2">
                    {isAuthenticated ? (
                      <UserDropdown />
                    ) : (
                      <Link href="/login">
                        <Button variant="outline" className="w-full">
                          Login
                        </Button>
                      </Link>
                    )}
                  </div>
                )}

                {isAdmin && isAuthenticated && (
                  <>
                    <Link href="/" className="pt-2">
                      <Button variant="outline" className="w-full">
                        Ver Site
                      </Button>
                    </Link>

                    <div className="border-t pt-4 mt-4">
                      <div className="flex flex-col space-y-2">
                        <Button variant="ghost" className="justify-start">
                          <User className="mr-2 h-4 w-4" />
                          Perfil
                        </Button>
                        <Button variant="ghost" className="justify-start">
                          <Settings className="mr-2 h-4 w-4" />
                          Configurações
                        </Button>
                        <Button variant="ghost" className="justify-start">
                          <HelpCircle className="mr-2 h-4 w-4" />
                          Ajuda
                        </Button>
                        <Button variant="ghost" className="justify-start text-red-500 hover:text-red-600" onClick={handleSignOut}>
                          <LogOut className="mr-2 h-4 w-4" />
                          Sair
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </nav>
            </div>
          </>
        ) : (
          <>
            <nav className="flex items-center space-x-6">{links.map(renderNavLink)}</nav>

            {!isAdmin && (
              <div className="flex items-center space-x-2">
                <ModeToggle />
                {isAuthenticated ? (
                  <UserDropdown />
                ) : (
                  <Link href="/login">
                    <Button className="text-black bg-accent-yellow hover:bg-accent-yellow-selection w-30 h-13.75 font-bold cursor-pointer">
                      Fazer login
                    </Button>
                  </Link>
                )}
              </div>
            )}

            {isAdmin && isAuthenticated && (
              <div className="flex items-center space-x-2">
                <ModeToggle />
                <UserDropdown />
              </div>
            )}
          </>
        )}
      </div>
    </header>
  )
}
