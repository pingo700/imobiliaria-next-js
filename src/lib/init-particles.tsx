import { initParticlesEngine } from "@tsparticles/react"
import { loadSlim } from "@tsparticles/slim"

type S = { promise: Promise<boolean> | null; initialized: boolean; initializing: boolean }
const g = globalThis as unknown as { __particlesInit?: S }
g.__particlesInit ??= { promise: null, initialized: false, initializing: false }

export async function initializeParticleSystem() {
  const s = g.__particlesInit!
  if (s.initialized) return true
  if (s.initializing && s.promise) return s.promise
  s.initializing = true
  s.promise = initParticlesEngine(async engine => {
    await loadSlim(engine)
  })
    .then(() => {
      s.initialized = true
      s.initializing = false
      return true
    })
    .catch(e => {
      s.initializing = false
      throw e
    })
  return s.promise
}
