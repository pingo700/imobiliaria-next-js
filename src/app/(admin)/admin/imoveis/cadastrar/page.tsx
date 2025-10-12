import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import PropertyEditor from '@/components/admin/property-editor'

export default function Page() {
  return (
    <>
      <div className="max-w-6xl mx-auto pt-4 md:pt-6">
        <Link
          href="/admin/imoveis"
          className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Voltar para imóveis
        </Link>
      </div>
      <PropertyEditor mode="create" />
    </>
  )
}