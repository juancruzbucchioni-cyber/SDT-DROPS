import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const IMAGE_DIR = 'C:\\Users\\Usuario\\Downloads\\remeras'

const names = [
  ['9.28.49 PM (1)', 'Camiseta Brasil Azul Edición Gráfica'],
  ['9.28.49 PM (2)', 'Camiseta Corea del Sur Roja'],
  ['9.28.49 PM', 'Camiseta Atlético de Madrid Azul y Amarilla'],
  ['9.28.50 PM (1)', 'Camiseta AC Milan Blanca'],
  ['9.28.50 PM (2)', 'Camiseta Arsenal Azul'],
  ['9.28.50 PM (3)', 'Camiseta Flamengo Azul Marino'],
  ['9.28.50 PM', 'Camiseta Real Madrid Negra Dragón'],
  ['9.28.51 PM (1)', 'Camiseta AC Milan Gris'],
  ['9.28.51 PM (2)', 'Camiseta Boca Juniors Amarilla y Azul'],
  ['9.28.51 PM', 'Camiseta Nigeria Negra y Verde'],
  ['9.28.52 PM (1)', 'Camiseta Corea del Sur Rosa Edición Gráfica'],
  ['9.28.52 PM (2)', 'Camiseta West Ham Bordó'],
  ['9.28.52 PM (3)', 'Camiseta Manchester City Celeste'],
  ['9.28.52 PM', 'Camiseta Japón Azul Samurai'],
  ['9.28.53 PM (1)', 'Chomba Flamengo Azul Marino'],
  ['9.28.53 PM (2)', 'Camiseta Cruzeiro Azul'],
  ['9.28.53 PM (3)', 'Camiseta Napoli Azul'],
  ['9.28.53 PM', 'Camiseta Independiente del Valle Blanca'],
  ['9.28.54 PM (1)', 'Camiseta São Paulo Blanca'],
  ['9.28.54 PM (2)', 'Chomba Real Madrid Blanca Monograma'],
  ['9.28.54 PM', 'Chomba Atlético de Madrid Azul'],
  ['9.28.55 PM (1)', 'Camiseta Benfica Roja'],
  ['9.28.55 PM (2)', 'Camiseta Bélgica Bordó'],
  ['9.28.55 PM (3)', 'Camiseta Juventus Celeste Edición Gráfica'],
  ['9.28.55 PM', 'Camiseta Atlético de Madrid Roja y Blanca'],
  ['9.28.56 PM (1)', 'Camiseta Corea del Sur Negra Edición Gráfica'],
  ['9.28.56 PM (2)', 'Camiseta AS Roma Blanca Riyadh Season'],
  ['9.28.56 PM (3)', 'Camiseta Corea del Sur Azul Flúor'],
  ['9.28.56 PM', 'Camiseta Brasil Amarilla'],
  ['9.28.57 PM (1)', 'Camiseta Real Madrid Negra Dragón Blanco'],
  ['9.28.57 PM (2)', 'Camiseta Borussia Dortmund Negra'],
  ['9.28.57 PM (3)', 'Camiseta Olympique de Marsella Turquesa'],
  ['9.28.57 PM', 'Camiseta Real Madrid Azul'],
  ['9.28.58 PM (1)', 'Camiseta Real Madrid Blanca Dragón'],
  ['9.28.58 PM (2)', 'Camiseta Real Madrid Azul Marino'],
  ['9.28.58 PM (3)', 'Camiseta Barcelona Naranja Retro'],
  ['9.28.58 PM', 'Camiseta Corinthians Blanca y Negra'],
  ['9.28.59 PM (1)', 'Camiseta Bélgica Roja'],
  ['9.28.59 PM (2)', 'Camiseta México Verde'],
  ['9.28.59 PM', 'Camiseta Borussia Dortmund Amarilla'],
  ['9.29.00 PM (1)', 'Camiseta Tottenham Blanca'],
  ['9.29.00 PM (2)', 'Camiseta Corinthians Negra'],
  ['9.29.00 PM (3)', 'Camiseta Bayer Leverkusen Blanca'],
  ['9.29.00 PM', 'Camiseta Barcelona Negra y Violeta'],
  ['9.29.01 PM (1)', 'Camiseta Japón Negra Dragón Rosa'],
  ['9.29.01 PM (2)', 'Camiseta Olympique de Marsella Blanca'],
  ['9.29.01 PM (3)', 'Camiseta Santos Blanca'],
  ['9.29.01 PM', 'Chomba Flamengo Turquesa'],
  ['9.29.02 PM (1)', 'Camiseta Corinthians Blanca Degradada'],
  ['9.29.02 PM (2)', 'Camiseta Alemania Blanca Retro'],
  ['9.29.02 PM', 'Camiseta Inter de Milán Azul y Negra'],
  ['9.29.03 PM (1)', 'Camiseta Bayer Leverkusen Negra y Roja'],
  ['9.29.03 PM (2)', 'Camiseta Japón Blanca Samurai'],
  ['9.29.03 PM (3)', 'Camiseta Atlético de Madrid Spider-Man'],
  ['9.29.03 PM', 'Camiseta Manchester City Blanca'],
  ['9.29.04 PM (1)', 'Camiseta Italia Blanca Versace'],
  ['9.29.04 PM (2)', 'Camiseta AS Roma Bordó'],
  ['9.29.04 PM (3)', 'Camiseta Manchester United Blanca'],
  ['9.29.04 PM', 'Camiseta Japón Gran Ola'],
  ['9.29.05 PM (1)', 'Camiseta Arsenal Roja'],
  ['9.29.05 PM (2)', 'Camiseta Flamengo Turquesa'],
  ['9.29.05 PM (3)', 'Camiseta Manchester United Roja'],
  ['9.29.05 PM', 'Camiseta Inter de Milán Blanca'],
  ['9.28.44 PM (1)', 'Camiseta AC Milan Amarilla'],
  ['9.28.44 PM', 'Camiseta Italia Negra Versace'],
  ['9.28.45 PM (1)', 'Camiseta Napoli Azul Edición Gráfica'],
  ['9.28.45 PM (2)', 'Camiseta Red Bull Bragantino Negra'],
  ['9.28.45 PM (3)', 'Camiseta Red Bull Bragantino Negra y Roja'],
  ['9.28.45 PM', 'Camiseta Croacia Azul'],
  ['9.28.46 PM (1)', 'Camiseta Jamaica Negra'],
  ['9.28.46 PM (2)', 'Camiseta Italia Azul Versace'],
  ['9.28.46 PM (3)', 'Camiseta São Paulo Roja, Negra y Blanca'],
  ['9.28.46 PM', 'Camiseta Corea del Sur Negra Abstracta'],
  ['9.28.47 PM (1)', 'Camiseta Italia Blanca'],
  ['9.28.47 PM (2)', 'Chomba Real Madrid Crema Dragón'],
  ['9.28.47 PM', 'Camiseta Italia Blanca Versace Medusa'],
  ['9.28.48 PM (1)', 'Camiseta Francia Azul Retro'],
  ['9.28.48 PM (2)', 'Camiseta Portugal Bordó'],
  ['9.28.48 PM (3)', 'Camiseta Ajax Azul Marino'],
  ['9.28.48 PM', 'Camiseta Fluminense Blanca'],
]

const envText = await fs.readFile(path.join(ROOT, '.env'), 'utf8')
const env = Object.fromEntries(envText.split(/\r?\n/).filter(Boolean).map((line) => {
  const index = line.indexOf('=')
  return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^['\"]|['\"]$/g, '')]
}))
const url = env.VITE_SUPABASE_URL
const key = env.VITE_SUPABASE_ANON_KEY
if (!url || !key) throw new Error('Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en .env')

const files = await fs.readdir(IMAGE_DIR)
const byToken = new Map(files.map((file) => [file.match(/at (.+)\.jpeg$/i)?.[1], file]))
const description = 'Camiseta de fútbol calidad premium. Talles disponibles: S, M, L, XL y XXL. Precio especial por cantidad. Para 500 unidades o más, consultá por una cotización mejorada.'
const colors = [
  { color: 'S', stock: 12 },
  { color: 'M', stock: 12 },
  { color: 'L', stock: 12 },
  { color: 'XL', stock: 12 },
  { color: 'XXL', stock: 12 },
]
const tier_prices = [
  { minQty: 1, maxQty: 9, unitPrice: 35000 },
  { minQty: 10, maxQty: 20, unitPrice: 24000 },
  { minQty: 21, maxQty: 50, unitPrice: 22500 },
  { minQty: 51, maxQty: 99, unitPrice: 21800 },
  { minQty: 100, maxQty: 299, unitPrice: 19900 },
  { minQty: 300, maxQty: 499, unitPrice: 17800 },
]

const products = names.map(([token, name], index) => {
  const file = byToken.get(token)
  if (!file) throw new Error(`No se encontró la imagen ${token}`)
  const id = `cam-fut-${String(index + 1).padStart(3, '0')}`
  return {
    source: path.join(IMAGE_DIR, file),
    object: `camisetas-2026/${id}.jpeg`,
    row: { id, name, description, cat: 'Camisetas', img: '', price: 35000, old: 0, tag: 'NUEVO', stock: 60, compatible_models: [], colors, tier_prices },
  }
})

const sqlQuote = (value) => `'${String(value).replaceAll("'", "''")}'`
const rowsSql = products.map(({ row, object }) => {
  const image = `${url}/storage/v1/object/public/products/${object}`
  return `(${[row.id, row.name, row.description, row.cat, image].map(sqlQuote).join(', ')}, ${row.price}, ${row.old}, ${sqlQuote(row.tag)}, ${row.stock}, '${JSON.stringify(row.compatible_models)}'::jsonb, '${JSON.stringify(row.colors)}'::jsonb, '${JSON.stringify(row.tier_prices)}'::jsonb)`
}).join(',\n')
const sql = `-- Carga de 80 camisetas. Ejecutar después de subir las imágenes con este script.\ninsert into public.products (id, name, description, cat, img, price, old, tag, stock, compatible_models, colors, tier_prices) values\n${rowsSql}\non conflict (id) do update set name=excluded.name, description=excluded.description, cat=excluded.cat, img=excluded.img, price=excluded.price, old=excluded.old, tag=excluded.tag, stock=excluded.stock, compatible_models=excluded.compatible_models, colors=excluded.colors, tier_prices=excluded.tier_prices;\n`
await fs.writeFile(path.join(ROOT, 'supabase', 'importar-remeras-2026.sql'), sql, 'utf8')

const headers = { apikey: key, Authorization: `Bearer ${key}` }
let uploaded = 0
for (const product of products) {
  const body = await fs.readFile(product.source)
  let response
  for (const bucket of ['products', 'Products']) {
    response = await fetch(`${url}/storage/v1/object/${bucket}/${product.object}`, {
      method: 'POST', headers: { ...headers, 'Content-Type': 'image/jpeg', 'x-upsert': 'true' }, body,
    })
    if (response.ok) {
      product.row.img = `${url}/storage/v1/object/public/${bucket}/${product.object}`
      break
    }
  }
  if (!response?.ok) throw new Error(`No se pudo subir ${product.source}: ${response?.status} ${await response?.text()}`)
  uploaded += 1
  process.stdout.write(`\rImágenes: ${uploaded}/${products.length}`)
}

const response = await fetch(`${url}/rest/v1/products?on_conflict=id`, {
  method: 'POST',
  headers: { ...headers, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=representation' },
  body: JSON.stringify(products.map(({ row }) => row)),
})
if (!response.ok) throw new Error(`No se pudieron guardar los productos: ${response.status} ${await response.text()}`)
const inserted = await response.json()
console.log(`\nProductos guardados: ${inserted.length}/${products.length}`)
console.log(`SQL de respaldo: ${path.join(ROOT, 'supabase', 'importar-remeras-2026.sql')}`)
