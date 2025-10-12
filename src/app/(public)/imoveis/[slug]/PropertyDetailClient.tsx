"use client"

import { useMemo, useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  Bed,
  Bath,
  Square,
  MapPin,
  Home,
  Tag,
  Heart,
  Share2,
  Phone,
  Mail,
  ImageIcon,
  Car,
  Maximize,
  Clock,
  Star,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Navigation,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Property } from "@/api"
import { FaWhatsapp } from "react-icons/fa"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"

function formatBRL(n?: number | null) {
  const v = typeof n === "number" ? n : 0
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)
}

export default function PropertyDetailClient({ property }: { property: Property }) {
  const router = useRouter()

  const [thumbsApi, setThumbsApi] = useState<CarouselApi>()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [showAllDetails, setShowAllDetails] = useState(false)
  const [carouselApi, setCarouselApi] = useState<CarouselApi>()
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([])

  const images = property?.images ?? []
  const hasImages = images.length > 0
  const d = property?.details

  useEffect(() => {
    if (!thumbsApi) return
    thumbsApi.scrollTo(currentImageIndex, true)
  }, [currentImageIndex, thumbsApi])

  useEffect(() => {
    const el = thumbRefs.current[currentImageIndex]
    if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
  }, [currentImageIndex])

  useEffect(() => {
    if (!carouselApi) return
    setCurrentImageIndex(carouselApi.selectedScrollSnap())
    const onSelect = () => setCurrentImageIndex(carouselApi.selectedScrollSnap())
    carouselApi.on("select", onSelect)
    return () => {
      carouselApi.off("select", onSelect)
    }
  }, [carouselApi])

  useEffect(() => {
    setCurrentImageIndex(0)
    carouselApi?.scrollTo(0)
  }, [images.length, carouselApi])

  const fullAddress = useMemo(() => {
    const parts = [property.address, property.location?.neighborhood, property.location?.city, property.location?.state].filter(Boolean)
    return parts.join(", ")
  }, [property])

  const handleViewOnGoogleMaps = () => {
    const coords = property.coordinates
    if (coords?.lat != null && coords?.lng != null) {
      const url = `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`
      window.open(url, "_blank")
      return
    }
    const q = encodeURIComponent(fullAddress || property.name)
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, "_blank")
  }

  const handleWhatsAppContact = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://Sistemaimobiliariavga.com.br"
    const message = encodeURIComponent(
      `Olá! Tenho interesse no imóvel "${property.name}". Poderiam me passar mais informações?\n${origin}/imoveis/${property.slug || property.id}`
    )
    window.open(`https://wa.me/Sistema?text=${message}`, "_blank")
  }

  const handleShare = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://Sistemaimobiliariavga.com.br"
    const url = `${origin}/imoveis/${property.slug || property.id}`
    if (navigator.share) {
      try {
        await navigator.share({ title: property.name, text: `Confira este imóvel: ${property.name}`, url })
      } catch {}
    } else {
      try { await navigator.clipboard.writeText(url) } catch {}
    }
  }

  const price = property.price || 0
  const pricePerM2 = d?.usableArea ? Math.round(price / Math.max(1, d.usableArea)) : 0
  const updatedAt = property.updatedAt || property.createdAt

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <div className="container px-3 sm:px-4 py-4 sm:py-6 lg:py-8 max-w-full overflow-x-hidden">
        <div className="grid gap-4 sm:gap-6 md:gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 md:space-y-8 min-w-0">
            <div className="space-y-3 md:space-y-4">
              <div className="relative aspect-[4/3] sm:aspect-[16/10] md:aspect-[4/3] overflow-hidden rounded-lg bg-muted">
                {hasImages ? (
                  <Carousel setApi={setCarouselApi} opts={{ align: "start", loop: true }} className="h-full">
                    <CarouselContent className="h-full">
                      {images.map((src, idx) => (
                        <CarouselItem key={idx} className="h-full">
                          <img
                            src={src}
                            alt={`${property.name} - ${idx + 1}`}
                            className="h-full w-full object-cover"
                            loading={idx === 0 ? "eager" : "lazy"}
                          />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full shadow-lg h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12" />
                    <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full shadow-lg h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12" />
                  </Carousel>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <ImageIcon className="mx-auto h-12 w-12 md:h-16 md:w-16 mb-3 md:mb-4 opacity-50" />
                      <p className="text-base md:text-lg">Sem imagem disponível</p>
                    </div>
                  </div>
                )}

                <Badge className="absolute right-2 sm:right-3 md:right-4 top-2 sm:top-3 md:top-4 text-xs font-medium border-0">
                  {d?.status || "—"}
                </Badge>

                <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-2 sm:left-3 md:left-4 rounded-md bg-black/50 px-2 py-1 text-xs text-white backdrop-blur">
                  {images.length ? currentImageIndex + 1 : 0} / {images.length}
                </div>
              </div>

              {hasImages && images.length > 1 && (
                <Carousel setApi={setThumbsApi} opts={{ align: "start", dragFree: true, containScroll: "trimSnaps" }} className="-mx-1 px-1">
                  <CarouselContent className="pb-2">
                    {images.map((img, idx) => (
                      <CarouselItem key={idx} className="basis-20 sm:basis-24 md:basis-28 lg:basis-28">
                        <button
                          className={`relative h-14 w-20 sm:h-16 sm:w-24 md:h-20 md:w-28 overflow-hidden rounded-md border-2 transition-all ${idx === currentImageIndex
                              ? "border-primary ring-2 ring-primary/20"
                              : "border-transparent hover:border-muted-foreground/20"
                            }`}
                          onClick={() => carouselApi?.scrollTo(idx)}
                          aria-label={`Ir para imagem ${idx + 1}`}
                          aria-current={idx === currentImageIndex ? "true" : undefined}
                          ref={(el) => { thumbRefs.current[idx] = el }}
                        >
                          <img src={img} alt={`${property.name} - thumb ${idx + 1}`} className="h-full w-full object-cover" loading="lazy" />
                        </button>
                      </CarouselItem>
                    ))}
                  </CarouselContent>

                  <CarouselPrevious className="h-7 w-7 -left-2 top-1/2 -translate-y-1/2" />
                  <CarouselNext className="h-7 w-7 -right-2 top-1/2 -translate-y-1/2" />
                </Carousel>
              )}
            </div>

            <div className="space-y-4 md:space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-balance mb-2 leading-tight">{property.name}</h1>
                <div className="space-y-3 sm:space-y-4 mt-6">
                  <div className="flex flex-row justify-between items-center">
                    <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary break-words">{formatBRL(price)}</p>
                    <div className="flex flex-row gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setIsLiked(!isLiked)} className="h-8 w-8 sm:h-9 sm:w-9 text-foreground hover:text-red-500 hover:bg-accent">
                        <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={handleShare} className="h-8 w-8 sm:h-9 sm:w-9 text-foreground hover:text-foreground hover:bg-accent">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-row gap-3">
                    <Button variant="outline" onClick={handleViewOnGoogleMaps} className="gap-2 bg-transparent w-full sm:w-auto text-sm border-input bg-background hover:bg-accent hover:text-accent-foreground text-foreground">
                      <Navigation className="h-4 w-4" />
                      Ver no Google Maps
                    </Button>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Atualizado em {new Date(updatedAt).toLocaleDateString("pt-BR")}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Bed className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xl font-bold">{d?.bedrooms ?? 0}</p>
                        <p className="text-sm text-muted-foreground">Quartos</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Bath className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xl font-bold">{d?.bathrooms ?? 0}</p>
                        <p className="text-sm text-muted-foreground">Banheiros</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Car className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xl font-bold">{d?.parking ?? 0}</p>
                        <p className="text-sm text-muted-foreground">Vagas</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Square className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xl font-bold">{d?.usableArea ?? 0}m²</p>
                        <p className="text-sm text-muted-foreground">Área Útil</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Detalhes do Imóvel</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowAllDetails(!showAllDetails)} className="gap-2 text-sm">
                    {showAllDetails ? "Ocultar detalhes" : "Exibir todos os detalhes"}
                    {showAllDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>

                {showAllDetails && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 animate-in slide-in-from-top-2 duration-300">
                    <Card className="border-muted"><CardContent className="flex items-center gap-3 p-3"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary"><Bed className="h-4 w-4 text-secondary-foreground" /></div><div className="min-w-0"><p className="font-semibold text-sm">{d?.suites ?? 0}</p><p className="text-xs text-muted-foreground">Suítes</p></div></CardContent></Card>
                    <Card className="border-muted"><CardContent className="flex items-center gap-3 p-3"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary"><Sparkles className="h-4 w-4 text-secondary-foreground" /></div><div className="min-w-0"><p className="font-semibold text-sm">{d?.laundries ?? 0}</p><p className="text-xs text-muted-foreground">Lavanderias</p></div></CardContent></Card>
                    <Card className="border-muted"><CardContent className="flex items-center gap-3 p-3"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary"><Sparkles className="h-4 w-4 text-secondary-foreground" /></div><div className="min-w-0"><p className="font-semibold text-sm">{d?.escritorios ?? 0}</p><p className="text-xs text-muted-foreground">Escritórios</p></div></CardContent></Card>
                    <Card className="border-muted"><CardContent className="flex items-center gap-3 p-3"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary"><Sparkles className="h-4 w-4 text-secondary-foreground" /></div><div className="min-w-0"><p className="font-semibold text-sm">{d?.closets ?? 0}</p><p className="text-xs text-muted-foreground">Closets</p></div></CardContent></Card>
                    <Card className="border-muted"><CardContent className="flex items-center gap-3 p-3"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary"><Bath className="h-4 w-4 text-secondary-foreground" /></div><div className="min-w-0"><p className="font-semibold text-sm">{d?.lavabos ?? 0}</p><p className="text-xs text-muted-foreground">Lavabos</p></div></CardContent></Card>
                    <Card className="border-muted"><CardContent className="flex items-center gap-3 p-3"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary"><Home className="h-4 w-4 text-secondary-foreground" /></div><div className="min-w-0"><p className="font-semibold text-sm">{d?.kitchens ?? 0}</p><p className="text-xs text-muted-foreground">Cozinhas</p></div></CardContent></Card>
                    <Card className="border-muted"><CardContent className="flex items-center gap-3 p-3"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary"><Home className="h-4 w-4 text-secondary-foreground" /></div><div className="min-w-0"><p className="font-semibold text-sm">{d?.estar ?? 0}</p><p className="text-xs text-muted-foreground">Salas de Estar</p></div></CardContent></Card>
                    <Card className="border-muted"><CardContent className="flex items-center gap-3 p-3"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary"><Home className="h-4 w-4 text-secondary-foreground" /></div><div className="min-w-0"><p className="font-semibold text-sm">{d?.jantar ?? 0}</p><p className="text-xs text-muted-foreground">Salas de Jantar</p></div></CardContent></Card>
                    <Card className="border-muted"><CardContent className="flex items-center gap-3 p-3"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary"><Maximize className="h-4 w-4 text-secondary-foreground" /></div><div className="min-w-0"><p className="font-semibold text-sm">{d?.totalArea ?? 0}m²</p><p className="text-xs text-muted-foreground">Área Total</p></div></CardContent></Card>
                  </div>
                )}
              </div>

              <Tabs defaultValue="description" className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-auto p-1">
                  <TabsTrigger value="description" className="text-xs sm:text-sm py-2 px-2">Descrição</TabsTrigger>
                  <TabsTrigger value="features" className="text-xs sm:text-sm py-2 px-2">Características</TabsTrigger>
                  <TabsTrigger value="details" className="text-xs sm:text-sm py-2 px-2">Detalhes</TabsTrigger>
                </TabsList>

                <TabsContent value="description" className="mt-4 sm:mt-6">
                  <Card>
                    <CardHeader className="pb-4 md:pb-6"><CardTitle className="flex items-center gap-2 text-lg md:text-xl">Sobre o Imóvel</CardTitle></CardHeader>
                    <CardContent className="space-y-4 pt-0">
                      <p className="text-sm md:text-base text-muted-foreground leading-relaxed whitespace-pre-line">{d?.description}</p>
                      <Separator />
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10"><Home className="h-4 w-4 text-primary" /></div>
                          <div><p className="font-medium text-sm md:text-base">{property.category}</p><p className="text-xs md:text-sm text-muted-foreground">Tipo do Imóvel</p></div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10"><Tag className="h-4 w-4 text-primary" /></div>
                          <div><p className="font-medium text-sm md:text-base">{d?.status || "—"}</p><p className="text-xs md:text-sm text-muted-foreground">Status</p></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="features" className="mt-4 sm:mt-6">
                  <Card>
                    <CardHeader className="pb-4 md:pb-6"><CardTitle className="flex items-center gap-2 text-lg md:text-xl">Características</CardTitle></CardHeader>
                    <CardContent className="pt-0">
                      {property.features && property.features.length > 0 ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                          {property.features.map((feature, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                              <span className="text-sm md:text-base">{feature}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm md:text-base text-muted-foreground">Sem características listadas.</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="details" className="mt-4 sm:mt-6">
                  <Card>
                    <CardHeader className="pb-4 md:pb-6"><CardTitle className="text-lg md:text-xl">Informações Técnicas</CardTitle></CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 pb-2 border-b"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20"><Square className="h-4 w-4 text-blue-600 dark:text-blue-400" /></div><h3 className="font-semibold text-base">Áreas</h3></div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="group relative"><div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"><div className="flex items-center gap-3"><div className="h-2 w-2 rounded-full bg-blue-500" /><span className="text-sm font-medium">Área Total</span></div><span className="font-bold ">{d?.totalArea ?? 0}m²</span></div></div>
                            <div className="group relative"><div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"><div className="flex items-center gap-3"><div className="h-2 w-2 rounded-full bg-green-500" /><span className="text-sm font-medium">Área Útil</span></div><span className="font-bold">{d?.usableArea ?? 0}m²</span></div></div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center gap-2 pb-2 border-b"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/20"><Home className="h-4 w-4 text-purple-600 dark:text-purple-400" /></div><h3 className="font-semibold text-base">Cômodos</h3></div>
                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"><div className="flex items-center gap-3"><Bed className="h-4 w-4 text-muted-foreground" /><span className="text-sm">Quartos</span></div><span className="font-semibold">{d?.bedrooms ?? 0}</span></div>
                            <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"><div className="flex items-center gap-3"><Bed className="h-4 w-4 text-muted-foreground" /><span className="text-sm">Suítes</span></div><span className="font-semibold">{d?.suites ?? 0}</span></div>
                            <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"><div className="flex items-center gap-3"><Bath className="h-4 w-4 text-muted-foreground" /><span className="text-sm">Banheiros</span></div><span className="font-semibold">{d?.bathrooms ?? 0}</span></div>
                            <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"><div className="flex items-center gap-3"><Home className="h-4 w-4 text-muted-foreground" /><span className="text-sm">Cozinhas</span></div><span className="font-semibold">{d?.kitchens ?? 0}</span></div>
                            <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"><div className="flex items-center gap-3"><Home className="h-4 w-4 text-muted-foreground" /><span className="text-sm">Salas de Estar</span></div><span className="font-semibold">{d?.estar ?? 0}</span></div>
                            <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"><div className="flex items-center gap-3"><Home className="h-4 w-4 text-muted-foreground" /><span className="text-sm">Salas de Jantar</span></div><span className="font-semibold">{d?.jantar ?? 0}</span></div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center gap-2 pb-2 border-b"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/20"><Sparkles className="h-4 w-4 text-orange-600 dark:text-orange-400" /></div><h3 className="font-semibold text-base">Espaços Adicionais</h3></div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"><div className="flex items-center gap-3"><Sparkles className="h-4 w-4 text-muted-foreground" /><span className="text-sm">Closets</span></div><span className="font-semibold">{d?.closets ?? 0}</span></div>
                            <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"><div className="flex items-center gap-3"><Bath className="h-4 w-4 text-muted-foreground" /><span className="text-sm">Lavabos</span></div><span className="font-semibold">{d?.lavabos ?? 0}</span></div>
                            <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"><div className="flex items-center gap-3"><Sparkles className="h-4 w-4 text-muted-foreground" /><span className="text-sm">Lavanderias</span></div><span className="font-semibold">{d?.laundries ?? 0}</span></div>
                            <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"><div className="flex items-center gap-3"><Sparkles className="h-4 w-4 text-muted-foreground" /><span className="text-sm">Escritórios</span></div><span className="font-semibold">{d?.escritorios ?? 0}</span></div>
                            <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"><div className="flex items-center gap-3"><Car className="h-4 w-4 text-muted-foreground" /><span className="text-sm">Vagas de Garagem</span></div><span className="font-semibold">{d?.parking ?? 0}</span></div>
                          </div>
                        </div>

                        <div className="mt-6 p-4 rounded-lg bg-muted/50">
                          <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 mt-0.5"><Tag className="h-4 w-4 text-primary" /></div>
                            <div className="space-y-1">
                              <h4 className="font-semibold text-sm">Resumo do Imóvel</h4>
                              <p className="text-xs text-muted-foreground">{property.category} • {d?.bedrooms ?? 0} quartos • {d?.bathrooms ?? 0} banheiros • {d?.usableArea ?? 0}m² úteis</p>
                              <div className="flex items-center gap-2 mt-2"><Badge variant="secondary" className="text-xs">{d?.status || "—"}</Badge><span className="te t-xs text-muted-foreground">Atualizado em {new Date(updatedAt).toLocaleDateString("pt-BR")}</span></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <div className="space-y-4 md:space-y-6 md:sticky lg:self-start min-w-0">
            <Card>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-3">
                  <Avatar className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16">
                    <AvatarImage src="/logo.png.png" />
                    <AvatarFallback>IB</AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-base sm:text-lg md:text-xl">Imobiliária Sistema</CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">Varginha • MG</p>
                <a href="https://share.google/NcjxfQKgGKAlu0kr2" target="_blank" rel="noreferrer">
                  <div className="flex items-center justify-center gap-1 text-xs sm:text-sm">
                    <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                    <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                    <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                    <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                    <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                    <span className="ml-1 text-muted-foreground">(4.9)</span>
                  </div>
                </a>
              </CardHeader>
              <Separator/>
              <CardContent className="space-y-3 pt-0">
                <Button className="w-full gap-2 h-11 text-sm sm:text-base" onClick={handleWhatsAppContact}>
                  <FaWhatsapp className="h-4 w-4" />
                  Entrar em contato
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}