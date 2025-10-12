'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuContent,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { User, LogOut, Eye, EyeOff, Edit, Loader2, MonitorCog } from 'lucide-react'
import { toast } from 'sonner'
import { usersService } from '@/api'
import { useLogout } from '@/api/hooks/mutations/useAuthMutations'
import { useCurrentUser } from '@/api/hooks/queries/useCurrentUser'
import { useQueryClient } from '@tanstack/react-query'

type Variant = 'default' | 'compact'

function getImageUrl(fotoPath?: string | null) {
  if (!fotoPath) return null
  if (/^https?:\/\//i.test(fotoPath)) return fotoPath
  return `https://Sistemaimobiliariavga.com.br/public/${fotoPath}`
}

type CurrentUserT = NonNullable<ReturnType<typeof useCurrentUser>['data']>

type ProfileModalProps = {
  isOpen: boolean
  onClose: () => void
  userData: CurrentUserT | null
  onProfileUpdated?: (u: CurrentUserT) => void
}

function ProfileModal({ isOpen, onClose, userData, onProfileUpdated }: ProfileModalProps) {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '', avatar: null as File | null })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [imagePreview, setImagePreview] = useState<string>('')

  const resetState = () => {
    setErrors({})
    setSuccessMessage('')
  }

  const openSync = () => {
    if (!userData) return
    setFormData({ username: userData.nome || '', email: userData.email || '', password: '', confirmPassword: '', avatar: null })
    resetState()
    setImagePreview(getImageUrl(userData.foto) || '')
  }

  const closeSync = () => {
    setFormData({ username: '', email: '', password: '', confirmPassword: '', avatar: null })
    resetState()
    setImagePreview('')
  }

  if (isOpen && !formData.username && userData) openSync()
  if (!isOpen && (formData.username || formData.email || imagePreview)) closeSync()

  const validateForm = () => {
    const e: Record<string, string> = {}
    if (!formData.username.trim()) e.username = 'Nome de usuário é obrigatório'
    else if (formData.username.length < 3) e.username = 'Nome de usuário deve ter pelo menos 3 caracteres'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) e.email = 'Email é obrigatório'
    else if (!emailRegex.test(formData.email)) e.email = 'Email deve ter um formato válido'
    if (formData.password && formData.password.length < 6) e.password = 'Senha deve ter pelo menos 6 caracteres'
    if (formData.password && !formData.confirmPassword) e.confirmPassword = 'Confirmação de senha é obrigatória'
    else if (formData.password && formData.password !== formData.confirmPassword) e.confirmPassword = 'Senhas não coincidem'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Arquivo inválido', { description: 'Selecione apenas arquivos de imagem.' })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande', { description: 'A imagem deve ter no máximo 5MB.' })
      return
    }
    setFormData(prev => ({ ...prev, avatar: file }))
    const reader = new FileReader()
    reader.onload = ev => setImagePreview(String(ev.target?.result || ''))
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setFormData(prev => ({ ...prev, avatar: null }))
    setImagePreview(getImageUrl(userData?.foto) || '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userData) return
    if (!validateForm()) return
    setIsSubmitting(true)
    try {
      await usersService.update(Number(userData.id), {
        usu_nome: formData.username,
        usu_email: formData.email,
        ...(formData.password ? { usu_senha: formData.password } : {}),
        ...(formData.avatar ? { usu_foto: formData.avatar } : {}),
      })
      const fresh = await usersService.getById(Number(userData.id))
      const nextUser: CurrentUserT = { id: fresh.id, nome: fresh.name, email: fresh.email, foto: fresh.photo ?? null }
      onProfileUpdated?.(nextUser)
      setSuccessMessage('Perfil atualizado com sucesso!')
      toast.success('Perfil atualizado', { description: 'Seu perfil foi atualizado com sucesso.' })
      setTimeout(() => onClose(), 1200)
    } catch (err: any) {
      const apiMsg = err?.message || 'Erro inesperado ao atualizar perfil'
      setErrors({ submit: apiMsg })
      toast.error('Erro ao atualizar perfil', { description: apiMsg })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Meu Perfil</DialogTitle>
          <DialogDescription>Visualize e edite suas informações de perfil</DialogDescription>
        </DialogHeader>

        {successMessage && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center space-y-3">
            <div className="relative">
              <Avatar className="w-20 h-20">
                {imagePreview ? (
                  <AvatarImage src={imagePreview} alt="Preview" className="object-cover" />
                ) : (
                  <AvatarFallback className="bg-muted border-2 border-dashed border-muted-foreground/30">
                    <User className="w-8 h-8 text-muted-foreground" />
                  </AvatarFallback>
                )}
              </Avatar>
              <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={isSubmitting} />
            </div>
            {formData.avatar && (
              <Button type="button" variant="outline" size="sm" onClick={removeImage} disabled={isSubmitting} className="text-xs">
                Cancelar alteração
              </Button>
            )}
            <p className="text-xs text-muted-foreground text-center">Clique para {formData.avatar ? 'alterar' : 'adicionar'} uma foto de perfil (máx. 5MB)</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="profile-username" className="text-sm font-medium">Nome de Usuário *</label>
            <Input type="text" id="profile-username" name="username" value={formData.username} onChange={handleInputChange} placeholder="Digite o nome de usuário" disabled={isSubmitting} className={errors.username ? 'border-red-300' : ''} />
            {errors.username && <p className="text-sm text-red-600">{errors.username}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="profile-email" className="text-sm font-medium">Email *</label>
            <Input type="email" id="profile-email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Digite o email" disabled={isSubmitting} className={errors.email ? 'border-red-300' : ''} />
            {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="profile-password" className="text-sm font-medium">Nova Senha (opcional)</label>
            <div className="relative">
              <Input type={showPassword ? 'text' : 'password'} id="profile-password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Digite a nova senha" disabled={isSubmitting} className={errors.password ? 'border-red-300 pr-10' : 'pr-10'} />
              <Button type="button" variant="ghost" size="icon" onClick={() => setShowPassword(v => !v)} className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" disabled={isSubmitting}>
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="profile-confirmPassword" className="text-sm font-medium">Confirmar Nova Senha</label>
            <div className="relative">
              <Input type={showConfirmPassword ? 'text' : 'password'} id="profile-confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder="Confirme a nova senha" disabled={isSubmitting} className={errors.confirmPassword ? 'border-red-300 pr-10' : 'pr-10'} />
              <Button type="button" variant="ghost" size="icon" onClick={() => setShowConfirmPassword(v => !v)} className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" disabled={isSubmitting}>
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
          </div>

          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{errors.submit}</p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Atualizando...</>) : (<><Edit className="w-4 h-4 mr-2" />Atualizar Perfil</>)}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function UserDropdown({ variant = 'default' }: { variant?: Variant }) {
  const router = useRouter()
  const { mutateAsync: doLogout } = useLogout()
  const qc = useQueryClient()
  const { data: user } = useCurrentUser()
  const [open, setOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

  const userData = useMemo(() => {
    const name = user?.nome || 'Usuário'
    const avatarUrl = getImageUrl(user?.foto) || null
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'
    const email = user?.email || ''
    return { name, avatarUrl, initials, email }
  }, [user])

  const handleSignOut = async () => {
    try {
      await doLogout()
      qc.invalidateQueries({ queryKey: ['auth', 'me'] })
    } catch {}
  }

  const handleGoToAdmin = () => router.push('/admin')

  const handleProfileUpdated = (updated: CurrentUserT) => {
    qc.setQueryData(['auth', 'me'], updated)
  }

  if (!user) return null

  if (variant === 'compact') {
    return (
      <>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userData.avatarUrl ?? undefined} alt={userData.name} className="object-cover" />
                <AvatarFallback>{userData.initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userData.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{userData.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => setIsProfileModalOpen(true)}>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleGoToAdmin}>
                <MonitorCog className="mr-2 h-4 w-4" />
                <span>Área Administrativa</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-red-500 focus:text-red-500">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          userData={user}
          onProfileUpdated={handleProfileUpdated}
        />
      </>
    )
  }

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-auto py-2 px-3 flex items-center gap-3">
            <div className="flex flex-col items-start text-left">
              <span className="font-medium text-sm">{userData.name}</span>
            </div>
            <Avatar className="h-8 w-8">
              <AvatarImage src={userData.avatarUrl ?? undefined} alt={userData.name} className="object-cover" />
              <AvatarFallback>{userData.initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{userData.name}</p>
              <p className="text-xs leading-none text-muted-foreground">{userData.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => setIsProfileModalOpen(true)}>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleGoToAdmin}>
              <MonitorCog className="mr-2 h-4 w-4" />
              <span>Área Administrativa</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="text-red-500 focus:text-red-500">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userData={user}
        onProfileUpdated={handleProfileUpdated}
      />
    </>
  )
}
