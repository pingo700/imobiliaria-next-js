"use client"

import { useMemo, useRef } from "react"
import Autoplay from "embla-carousel-autoplay"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { InfiniteScroll } from "@/components/public/home/infinite-bg"
import { PropertyCard } from "@/components/public/home/property-card"
import PropertySearch from "@/components/public/home/property-search"
import { usePublicProperties, type Property } from "@/api"

type Categoria = Property["category"]

const IMO_CATEGORIAS: Record<Categoria, string> = {
  Casa: "Casas em destaque",
  Apartamento: "Apartamentos com conforto e praticidade",
  Terreno: "Terrenos para construir e crescer",
  Comercial: "Imóveis comerciais",
}

const CATEGORY_ORDER: Categoria[] = ["Casa", "Apartamento", "Terreno", "Comercial"]

function CategoryCarousel({ title, items }: { title: string; items: Property[] }) {
  const autoplay = useRef(Autoplay({ delay: 2200, stopOnInteraction: false, stopOnMouseEnter: true, playOnInit: true }))
  if (!items.length) return null
  return (
    <section className="w-full py-8 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-semibold">{title}</h2>
        <Carousel
          opts={{ align: "start", loop: items.length > 1, containScroll: "trimSnaps" }}
          plugins={[autoplay.current]}
          className="w-full mt-6"
        >
          <div className="flex justify-end gap-2 mt-4">
            <CarouselPrevious className="static transform-none h-8 w-8 md:h-10 md:w-10 rounded-full" />
            <CarouselNext className="static transform-none h-8 w-8 md:h-10 md:w-10 rounded-full" />
          </div>
          <div className="rounded-md overflow-hidden">
            <CarouselContent className="ml-2 md:-ml-4 rounded-full">
              {items.map((p) => (
                <CarouselItem
                  key={p.id}
                  className="pl-2 md:pl-4 basis-full sm:basis-4/5 md:basis-3/4 lg:basis-2/3"
                >
                  <PropertyCard property={p} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </div>
        </Carousel>
      </div>
    </section>
  )
}

function usePropertySections(list: Property[]) {
  const recent = useMemo(() => {
    const ts = (p: Property) => Date.parse(p.updatedAt || p.createdAt)
    return [...list].sort((a, b) => ts(b) - ts(a)).slice(0, 12)
  }, [list])

  const byCategory = useMemo(() => {
    const acc: Record<Categoria, Property[]> = { Casa: [], Apartamento: [], Terreno: [], Comercial: [] }
    for (const p of list) acc[p.category].push(p)
    return acc
  }, [list])

  const categories = useMemo(() => {
    return CATEGORY_ORDER.map((cat) => {
      const items = byCategory[cat]
      if (!items.length) return null
      return { title: IMO_CATEGORIAS[cat], items: items.slice(0, 12) }
    }).filter(Boolean) as { title: string; items: Property[] }[]
  }, [byCategory])

  return [{ title: "Imóveis recém adicionados", items: recent }, ...categories]
}

export default function HomeClient() {
  const { data: list = [], isLoading, error } = usePublicProperties()
  const sections = usePropertySections(list)
  if (error) console.error(error)

  return (
    <>
      <PropertySearch />

      {!isLoading && sections.map((s) => <CategoryCarousel key={s.title} title={s.title} items={s.items} />)}

      <section className="min-h-1/3 relative text-foreground overflow-hidden snap-center" id="sobre">
        <InfiniteScroll
          imageSrcLight="/city-bg/light.png"
          imageSrcDark="/city-bg/dark.png"
          className="-z-10"
          speed={80000}
          blur={6}
          overlayOpacity={0.7}
        />
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="relative overflow-hidden rounded-lg">
                <img src="/images/team.png" alt="Equipe Sistema Imobiliária" className="w-full h-auto object-cover" />
              </div>
            </div>
            <div className="order-1 lg:order-2 space-y-8">
              <div>
                <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6 tracking-wide">Sobre nós</h2>
                <div className="w-16 h-px bg-foreground/20 mb-8" />
              </div>
              <div className="space-y-6">
                <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed font-medium">
                  Somos uma <span className="text-foreground font-medium">empresa familiar</span> com{" "}
                  <span className="text-foreground font-medium">10+ anos de experiência</span>.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                  Profissionalismo, segurança e agilidade com foco nas necessidades dos clientes.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                  Missão: <span className="text-foreground font-medium">conectar pessoas ao lar dos sonhos</span>.
                </p>
              </div>
              <div className="pt-8 border-t border-border">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="text-center sm:text-left">
                    <div className="text-2xl font-medium text-foreground mb-2">+10</div>
                    <div className="text-sm text-muted-foreground font-medium">Anos de experiência</div>
                  </div>
                  <div className="text-center sm:text-left">
                    <div className="text-2xl font-medium text-foreground mb-2">100%</div>
                    <div className="text-sm text-muted-foreground font-medium">Empresa familiar</div>
                  </div>
                  <div className="text-center sm:text-left">
                    <div className="text-2xl font-medium text-foreground mb-2">100%</div>
                    <div className="text-sm text-muted-foreground font-medium">Transparência</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
