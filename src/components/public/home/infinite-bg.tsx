import * as React from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

interface InfiniteScrollProps {
  imageSrc?: string
  imageSrcLight?: string
  imageSrcDark?: string
  speed?: number
  height?: string
  className?: string
  alt?: string
  pauseOnHover?: boolean
  overlayOpacity?: number
  blur?: number
}

const InfiniteScroll = React.forwardRef<HTMLDivElement, InfiniteScrollProps>(
  ({ 
    imageSrc,
    imageSrcLight,
    imageSrcDark,
    speed = 20000, 
    height = "100%", 
    className, 
    alt = "",
    pauseOnHover = true,
    overlayOpacity = 0,
    blur = 0,
    ...props 
  }, ref) => {
    const { theme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
      setMounted(true)
    }, [])

    const getCurrentImageSrc = () => {
      if (imageSrc) return imageSrc
      if (!mounted) {
        return imageSrcLight || imageSrcDark || ""
      }
      
      if (imageSrcLight && imageSrcDark) {
        const currentTheme = resolvedTheme || theme
        const isDark = currentTheme === "dark" || 
          (currentTheme === "system" && 
           typeof window !== "undefined" && 
           window.matchMedia("(prefers-color-scheme: dark)").matches)
        return isDark ? imageSrcDark : imageSrcLight
      }
      
      return imageSrcLight || imageSrcDark || ""
    }

    const currentImageSrc = getCurrentImageSrc()

    return (
      <div
        ref={ref}
        className={cn("infinite-scroll-container", className)}
        style={{ height }}
        {...props}
      >
        <div 
          key={`${currentImageSrc}-${mounted}`}
          className={cn(
            "infinite-scroll-wrapper",
            pauseOnHover && "infinite-scroll-pause-on-hover"
          )}
          style={{ 
            '--scroll-speed': `${speed}ms`,
            filter: blur > 0 ? `blur(${blur}px)` : undefined
          } as React.CSSProperties & { '--scroll-speed': string }}
        >
          <div 
            className="infinite-scroll-item"
            style={{ backgroundImage: `url(${currentImageSrc})` }}
            aria-label={alt}
          />
          <div 
            className="infinite-scroll-item"
            style={{ backgroundImage: `url(${currentImageSrc})` }}
            aria-hidden="true"
          />
        </div>

        {overlayOpacity > 0 && (
          <div 
            className="absolute inset-0 bg-background pointer-events-none"
            style={{ opacity: overlayOpacity }}
          />
        )}
      </div>
    )
  }
)

InfiniteScroll.displayName = "InfiniteScroll"

export { InfiniteScroll, type InfiniteScrollProps }