// app/(admin)/layout.tsx
import { ReactNode } from 'react'
import { requireAuth } from '@/lib/auth'
import { LayoutAdmin } from '@/components/layouts/admin'
import { QueryProvider } from '@/providers/query-provider'

// export const dynamic = 'force-dynamic'

export const fetchCache = 'force-no-store';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAuth({ next: '/admin', role: 'admin' })
  return (
    <QueryProvider>
      <LayoutAdmin>{children}</LayoutAdmin>
    </QueryProvider>
  )
}
