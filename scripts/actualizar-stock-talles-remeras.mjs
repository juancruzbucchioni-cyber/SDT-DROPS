import fs from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const envText = await fs.readFile(path.join(root, '.env'), 'utf8')
const env = Object.fromEntries(envText.split(/\r?\n/).filter((line) => line.includes('=')).map((line) => {
  const index = line.indexOf('=')
  return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^['\"]|['\"]$/g, '')]
}))

const url = env.VITE_SUPABASE_URL
const key = env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  throw new Error('Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en .env')
}

const description = 'Camiseta de fútbol calidad premium. Talles disponibles: S, M, L, XL y XXL. Precio especial por cantidad. Para 500 unidades o más, consultá por una cotización mejorada.'
const colors = [
  { color: 'S', stock: 12 },
  { color: 'M', stock: 12 },
  { color: 'L', stock: 12 },
  { color: 'XL', stock: 12 },
  { color: 'XXL', stock: 12 },
]

const endpoint = new URL(`${url}/rest/v1/products`)
endpoint.searchParams.set('id', 'like.cam-fut-*')

const response = await fetch(endpoint, {
  method: 'PATCH',
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  },
  body: JSON.stringify({ stock: 60, description, colors }),
})

if (!response.ok) {
  throw new Error(`${response.status}: ${await response.text()}`)
}

const rows = await response.json()
console.log(`Camisetas actualizadas: ${rows.length}`)
