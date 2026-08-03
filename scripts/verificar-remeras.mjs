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
const response = await fetch(`${url}/rest/v1/products?select=id,cat,stock,img,colors,tier_prices&id=like.cam-fut-*`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` },
})
if (!response.ok) throw new Error(`${response.status}: ${await response.text()}`)
const rows = await response.json()
const checks = await Promise.all(rows.map(({ img }) => fetch(img, { method: 'HEAD' }).then((result) => result.ok)))
console.log(JSON.stringify({
  productos: rows.length,
  imagenes_publicas: checks.filter(Boolean).length,
  categoria_camisetas: rows.filter(({ cat }) => cat === 'Camisetas').length,
  stock_60: rows.filter(({ stock }) => stock === 60).length,
  talles_completos: rows.filter(({ colors }) => Array.isArray(colors) && colors.map(({ color }) => color).join(',') === 'S,M,L,XL,XXL').length,
  stock_por_talle_12: rows.filter(({ colors }) => Array.isArray(colors) && colors.length === 5 && colors.every(({ stock }) => stock === 12)).length,
  precios_por_cantidad: rows.filter(({ tier_prices }) => Array.isArray(tier_prices) && tier_prices.length === 6).length,
}, null, 2))
