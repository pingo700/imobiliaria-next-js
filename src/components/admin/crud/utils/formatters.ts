export const formatters = {
  date: (value: string) => {
    if (!value) return '-'
    try {
      return new Date(value).toLocaleDateString('pt-BR')
    } catch {
      return '-'
    }
  },
  dateTime: (value: string) => {
    if (!value) return '-'
    try {
      const date = new Date(value)
      const now = new Date()
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      const formatted = date.toLocaleString('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
      let relative = ''
      if (diffInMinutes < 1) relative = ' (agora)'
      else if (diffInMinutes < 60) relative = ` (há ${diffInMinutes}m)`
      else if (diffInMinutes < 1440) relative = ` (há ${Math.floor(diffInMinutes / 60)}h)`
      else if (diffInMinutes < 10080) relative = ` (há ${Math.floor(diffInMinutes / 1440)}d)`
      return formatted + relative
    } catch {
      return '-'
    }
  },
  currency: (value: number) => {
    if (!Number.isFinite(value)) return '-'
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  },
  cpfCnpj: (value: string) => {
    if (!value) return '-'
    const numbers = value.replace(/\D/g, '')
    if (numbers.length === 11) return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    if (numbers.length === 14) return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    return value
  },
  phone: (value: string) => {
    if (!value) return '-'
    const numbers = value.replace(/\D/g, '')
    if (numbers.length === 10) return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    if (numbers.length === 11) return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    return value
  },
  boolean: (value: boolean) => (value ? 'Sim' : 'Não'),
  percentage: (value: number) => Number.isFinite(value) ? `${(value * 100).toFixed(2)}%` : '-',
  truncate: (maxLength: number) => (value: string) => {
    if (!value) return '-'
    if (value.length <= maxLength) return value
    return `${value.slice(0, maxLength)}...`
  },
  capitalize: (value: string) => {
    if (!value) return '-'
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
  },
  status: (statuses: Record<string, { label: string; variant?: string }>) => (value: string) => {
    if (!value) return '-'
    return statuses[value]?.label || value
  }
}

export const parsers = {
  number: (value: string) => {
    const parsed = parseFloat(value)
    return isNaN(parsed) ? undefined : parsed
  },
  integer: (value: string) => {
    const parsed = parseInt(value, 10)
    return isNaN(parsed) ? undefined : parsed
  },
  boolean: (value: string) => value === 'true' || value === '1',
  date: (value: string) => !value ? undefined : new Date(value),
  removeNonDigits: (value: string) => value.replace(/\D/g, ''),
  trim: (value: string) => value?.trim() || undefined
}
