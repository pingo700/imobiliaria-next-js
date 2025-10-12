"use client"

import { memo, useCallback, useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import { useTheme } from "next-themes"
import type { Container, ISourceOptions } from "@tsparticles/engine"
import { initializeParticleSystem } from "@/lib/init-particles"

const Particles = dynamic(async () => (await import("@tsparticles/react")).default, { ssr: false })

function useMounted() {
  const [m, setM] = useState(false)
  useEffect(() => setM(true), [])
  return m
}

function ParticleSystemComponent() {
  const { resolvedTheme } = useTheme()
  const mounted = useMounted()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    initializeParticleSystem().then(() => setReady(true)).catch(() => setReady(false))
  }, [])

  const isDark = (resolvedTheme ?? "light") === "dark"

  const options = useMemo<ISourceOptions>(() => ({
    fpsLimit: 60,
    pauseOnBlur: true,
    pauseOnOutsideViewport: true,
    fullScreen: { enable: false },
    detectRetina: true,
    motion: { reduce: { value: true, factor: 2 }, disable: false },
    background: { color: { value: isDark ? "#000000" : "#fafafa" } },
    interactivity: {
      events: { onClick: { enable: true, mode: "push" }, onHover: { enable: true, mode: "repulse" }, resize: { enable: true }},
      modes: { push: { quantity: 4 }, repulse: { distance: 200, duration: 0.4 } }
    },
    particles: {
      color: { value: isDark ? "#333333" : "#f1f1f1" },
      links: { enable: true, color: "#eab92f", distance: 150, opacity: 0.5, width: 1 },
      move: { enable: true, direction: "none", outModes: { default: "bounce" }, speed: 3, straight: false, random: false },
      number: { density: { enable: true, area: 1080 }, value: 150 },
      opacity: { value: { min: 0.1, max: 0.5 }, animation: { enable: true, speed: 1, minimumValue: 0.1 } },
      shape: { type: "circle" },
      size: { value: { min: 1, max: 2 }, random: { enable: true } }
    },
    responsive: [
      { maxWidth: 768, options: { particles: { number: { value: 80 } }, interactivity: { modes: { repulse: { distance: 140 } } } } },
      { maxWidth: 420, options: { fpsLimit: 45, particles: { number: { value: 50 } } } }
    ],
    zLayers: 1
  }), [isDark])

  const particlesLoaded = useCallback(async (_?: Container) => {}, [])

  if (!mounted || !ready) return null

  return <Particles id="tsparticles" className="-z-10 absolute inset-0" options={options} particlesLoaded={particlesLoaded} />
}

export const ParticleSystem = memo(ParticleSystemComponent)
