import { z } from 'zod'

const urlSchema = z.string().url()

export const env = {
  get API_BASE_URL() {
    const raw =
      process.env.API_BASE_URL ??
      process.env.NEXT_PUBLIC_API_URL ??
      process.env.APP_URL ??
      ''
    const parsed = urlSchema.safeParse(raw)
    // fallback seguro para build/CI sem variável definida
    return parsed.success ? parsed.data : 'http://localhost:3000'
  },
  get NOMINATIM_UA() {
    return z.string().min(1).parse(process.env.NOMINATIM_UA)
  },
  get NOMINATIM_EMAIL() {
    return z.string().email().parse(process.env.NOMINATIM_EMAIL)
  },
}