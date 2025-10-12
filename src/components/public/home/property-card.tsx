'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Camera, Toilet, Car, Bed, Scan } from 'lucide-react'
import type { Property } from '@/api'
import { cn } from '@/lib/utils'

type PropertyCardProps = {
  property: Property
}

export function PropertyCard({ property }: PropertyCardProps) {
  const router = useRouter()
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const firstImage = property.images?.[0] ?? null
  const photoCount = property.images?.length ?? 0
  const imageUrl = firstImage || null

  const address = [property.address, property.location?.neighborhood, property.location?.city]
    .filter(Boolean)
    .join(', ')

  const bedrooms = property.details?.bedrooms ?? 0
  const bathrooms = property.details?.bathrooms ?? 0
  const vagas = property.details?.parking ?? 0
  const area = property.details?.usableArea ?? 0

  const handlePropertyClick = () => {
    if (property.slug) router.push(`/imoveis/${property.slug}`)
  }

  return (
    <Card className="overflow-hidden border-0 rounded-lg p-0">
      <div className="relative w-full h-[300px] sm:h-[350px] md:h-[400px] lg:h-[500px]">
        {/* Imagem */}
        {imageUrl && !imageError ? (
          <>
            <Image
              src={imageUrl}
              alt={property.name || 'Imóvel'}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 50vw"
              className={cn(
                'object-cover transition-opacity duration-300',
                imageLoaded ? 'opacity-100' : 'opacity-0'
              )}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true)
                setImageLoaded(true)
              }}
              priority={false}
            />
            {!imageLoaded && <div className="absolute inset-0 bg-neutral-200 animate-pulse" />}
          </>
        ) : (
          <div className="absolute inset-0 bg-neutral-300 flex items-center justify-center">
            <Camera className="w-16 h-16 text-neutral-500" />
          </div>
        )}

        {/* Overlay topo (contagem de fotos) */}
        <div className="absolute inset-0 flex flex-col justify-between">
          <div className="flex flex-row justify-between mx-3 md:mx-6 mt-4">
            <div className="flex flex-row gap-2">
              {photoCount > 0 && (
                <Badge className="w-10 md:w-12 h-7 md:h-8 backdrop-blur-md bg-white/60 dark:bg-black/60 dark:text-white text-black rounded-full">
                  <Camera className="w-4 h-4 mr-1" />
                  {photoCount}
                </Badge>
              )}
            </div>
          </div>

          {/* Overlay base (infos) */}
          <div className="flex flex-col p-3 md:p-6 sm:w-4/5 md:w-3/4 lg:w-1/2 m-2 md:m-4 text-black rounded-md backdrop-blur-md bg-white/60 dark:bg-black/60 dark:text-white">
            {/* Título clicável */}
            {property.slug ? (
              <Link href={`/imoveis/${property.slug}`}>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold transition-all hover:text-accent-yellow cursor-pointer">
                  {property.name}
                </h1>
              </Link>
            ) : (
              <h1
                className="text-xl md:text-2xl lg:text-3xl font-bold cursor-default"
                onClick={handlePropertyClick}
              >
                {property.name}
              </h1>
            )}

            <p className="text-sm md:text-base">{property.category}</p>
            <p className="text-sm md:text-base">{address}</p>

            <div className="flex flex-row flex-wrap gap-2 md:gap-4 mt-2 md:mt-3 text-sm md:text-base">
              {bedrooms > 0 && (
                <div className="flex flex-row gap-1 md:gap-2 items-center">
                  <Bed size={16} className="md:size-6" />
                  <p>{bedrooms}</p>
                </div>
              )}
              {bathrooms > 0 && (
                <div className="flex flex-row gap-1 md:gap-2 items-center">
                  <Toilet size={16} className="md:size-6" />
                  <p>{bathrooms}</p>
                </div>
              )}
              {vagas > 0 && (
                <div className="flex flex-row gap-1 md:gap-2 items-center">
                  <Car size={16} className="md:size-6" />
                  <p>{vagas}</p>
                </div>
              )}
              {area > 0 && (
                <div className="flex flex-row gap-1 md:gap-2 items-center">
                  <Scan size={16} className="md:size-6" />
                  <p>{area} m²</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Clicar em qualquer lugar do banner (opcional) */}
        {/* <button className="absolute inset-0" onClick={handlePropertyClick} aria-label={`Abrir ${property.name}`} /> */}
      </div>
    </Card>
  )
}
