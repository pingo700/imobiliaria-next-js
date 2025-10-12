import { NextResponse } from 'next/server'
import { env } from '@/lib/env'

export const runtime = 'nodejs'

const UF_TO_STATE: Record<string, string> = {
  AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas', BA: 'Bahia', CE: 'Ceará',
  DF: 'Distrito Federal', ES: 'Espírito Santo', GO: 'Goiás', MA: 'Maranhão',
  MT: 'Mato Grosso', MS: 'Mato Grosso do Sul', MG: 'Minas Gerais', PA: 'Pará',
  PB: 'Paraíba', PR: 'Paraná', PE: 'Pernambuco', PI: 'Piauí', RJ: 'Rio de Janeiro',
  RN: 'Rio Grande do Norte', RS: 'Rio Grande do Sul', RO: 'Rondônia', RR: 'Roraima',
  SC: 'Santa Catarina', SP: 'São Paulo', SE: 'Sergipe', TO: 'Tocantins'
}

export async function GET(req: Request) {
  const u = new URL(req.url)
  const cep = (u.searchParams.get('cep') || '').replace(/\D/g, '')
  if (!/^\d{8}$/.test(cep)) return NextResponse.json({ status: 'error', message: 'CEP inválido' }, { status: 400 })

  const viacepRes = await fetch(`https://viacep.com.br/ws/${cep}/json/`, { next: { revalidate: 86400 } })
  if (!viacepRes.ok) return NextResponse.json({ status: 'error', message: 'Falha ao consultar ViaCEP' }, { status: viacepRes.status })
  const v = await viacepRes.json().catch(() => null)
  if (!v || v?.erro) return NextResponse.json({ status: 'error', message: 'CEP não encontrado' }, { status: 404 })

  const uf = v.uf || ''
  const estadoNome = UF_TO_STATE[uf as keyof typeof UF_TO_STATE] || ''

  let latitude: number | undefined
  let longitude: number | undefined

  const qs = new URLSearchParams({
    street: v.logradouro || '',
    city: v.localidade || '',
    state: uf || '',
    country: 'Brazil',
    format: 'json',
    limit: '1'
  }).toString()

  const headers: Record<string, string> = {}
  if (env.NOMINATIM_UA) headers['User-Agent'] = String(env.NOMINATIM_UA)
  if (env.NOMINATIM_EMAIL) headers['From'] = String(env.NOMINATIM_EMAIL)

  const nominatimRes = await fetch(`https://nominatim.openstreetmap.org/search?${qs}`, {
    headers,
    next: { revalidate: 86400 }
  }).catch(() => null)

  if (nominatimRes && nominatimRes.ok) {
    const ctype = nominatimRes.headers.get('content-type') || ''
    if (ctype.includes('application/json')) {
      const arr = await nominatimRes.json().catch(() => null)
      if (Array.isArray(arr) && arr[0] && arr[0].lat && arr[0].lon) {
        const lat = parseFloat(arr[0].lat)
        const lon = parseFloat(arr[0].lon)
        if (Number.isFinite(lat) && Number.isFinite(lon)) {
          latitude = lat
          longitude = lon
        }
      }
    }
  }

  return NextResponse.json({
    cep: v.cep,
    logradouro: v.logradouro,
    complemento: v.complemento,
    bairro: v.bairro,
    localidade: v.localidade,
    uf,
    estado: undefined,
    estadoNome,
    latitude,
    longitude
  })
}