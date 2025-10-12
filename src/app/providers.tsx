'use client'

import { ThemeProvider } from '@/providers/theme-provider'
import { QueryProvider } from '@/providers/query-provider'
import { Toaster as SonnerToaster, type ToasterProps } from 'sonner'
import { useTheme } from 'next-themes'

function Sonner() {
  const { resolvedTheme } = useTheme()
  return (
    <SonnerToaster
      richColors
      expand
      closeButton
      theme={resolvedTheme as ToasterProps['theme']}
    />
  )
}

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryProvider>
        {children}
        <Sonner />
      </QueryProvider>
    </ThemeProvider>
  )
}
