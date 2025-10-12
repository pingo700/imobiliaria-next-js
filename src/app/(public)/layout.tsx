import { ReactNode } from 'react'
import { LayoutDefault } from '@/components/layouts/default'

export default function PublicLayout({ children }: { children: ReactNode }) {
  return <LayoutDefault>{children}</LayoutDefault>
}
