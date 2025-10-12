import type { ReactNode } from "react"
import { Navbar } from "@/components/public/navbar"
import { Footer } from "@/components/public/footer"

interface LayoutDefaultProps {
  children: ReactNode
}

export function LayoutDefault({ children }: LayoutDefaultProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 w-full">
        <div className="container mx-auto px-4">{children}</div>
      </main>
      <Footer />
    </div>
  )
}
