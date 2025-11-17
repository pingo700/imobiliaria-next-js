'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ParticleSystem } from '@/components/public/particles'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

type Props = { nextParam: string }

// ✅ ADICIONE: Interface para tipagem da resposta
interface LoginResponse {
  message?: string;
  success?: boolean;
}

export default function LoginClient({ nextParam }: Props) {
  const router = useRouter()

  const [rememberMe, setRememberMe] = React.useState(false)
  const [csrf, setCsrf] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const emailRef = React.useRef<HTMLInputElement>(null)
  const passwordRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    const remembered = localStorage.getItem('rememberedUser')
    if (remembered) {
      setRememberMe(true)
      requestAnimationFrame(() => {
        if (emailRef.current && !emailRef.current.value) emailRef.current.value = remembered
      })
    }
  }, [])

  React.useEffect(() => {
    fetch('/api/auth/csrf', { credentials: 'include', cache: 'no-store' })
      .then(r => r.json()).then(d => setCsrf(d.token)).catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      const fd = new FormData(e.currentTarget)
      const email = String(fd.get('email') || '').trim()
      const password = String(fd.get('password') || '')
      if (!email || !password) {
        toast.error('Preencha email e senha')
        return
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-csrf-token': csrf },
        credentials: 'include',
        cache: 'no-store',
        body: JSON.stringify({ email, senha: password }),
      })

      // ✅ CORRIGIDO: Adicionar tipo LoginResponse
      let data: LoginResponse = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }
      
      if (!res.ok) {
        const msg = data?.message || 'Credenciais inválidas'
        toast.error('Falha no login', { description: msg })
        return
      }

      if (rememberMe) localStorage.setItem('rememberedUser', email)
      else localStorage.removeItem('rememberedUser')

      toast.success('Login realizado!')
      router.refresh()
    } catch {
      toast.error('Erro ao conectar com o servidor')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="flex margin-web h-screen items-center">
      <ParticleSystem />
      <div className="container flex shadow-md bg-white dark:bg-[#121212] rounded-lg max-w-md mx-auto items-center justify-center py-8 px-4 md:px-6">
        <div className="w-full space-y-6">
          <div className="space-y-2 text-center">
            <Image src="/globals.css" width={500} height={500} alt="Logo Imobiliária Sistema" className="mx-auto" priority />
            <p className="text-muted-foreground">Entre com suas credenciais para acessar sua conta</p>
          </div>

          <form
            id="login-form"
            method="post"
            action="/api/auth/login"
            onSubmit={handleSubmit}
            autoComplete="on"
            className="space-y-4"
            noValidate
          >
            <input type="hidden" name="csrfToken" value={csrf} readOnly />
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                ref={emailRef}
                id="email"
                name="email"
                type="email"
                placeholder="nome@exemplo.com"
                autoComplete="username"
                inputMode="email"
                defaultValue=""
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">Esqueceu a senha?</Link>
              </div>
              <Input
                ref={passwordRef}
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                defaultValue=""
                disabled={isSubmitting}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={val => setRememberMe(Boolean(val))}
                disabled={isSubmitting}
              />
              <Label htmlFor="rememberMe" className="text-sm font-normal">Lembrar-me</Label>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            <p>Problemas para acessar?</p>
            <Link href="/support" className="text-primary hover:underline">Entre em contato com o suporte</Link>
          </div>
        </div>
      </div>
    </section>
  )
}
