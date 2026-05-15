# SDT DROPS - Supabase + Hostinger

## 1) Crear proyecto en Supabase
1. Crea un proyecto nuevo.
2. En `SQL Editor`, ejecuta:

```sql
create table if not exists public.sdt_app_state (
  id text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.sdt_app_state enable row level security;

drop policy if exists "anon can read state" on public.sdt_app_state;
create policy "anon can read state"
on public.sdt_app_state
for select
to anon
using (true);

drop policy if exists "anon can write state" on public.sdt_app_state;
create policy "anon can write state"
on public.sdt_app_state
for insert
to anon
with check (true);

drop policy if exists "anon can update state" on public.sdt_app_state;
create policy "anon can update state"
on public.sdt_app_state
for update
to anon
using (true)
with check (true);
```

## 2) Copiar API pública
En `Project Settings -> API`, copiá:
- `Project URL`
- `anon public key`

## 3) Variables en el proyecto
Crea `.env` en `Web`:

```env
VITE_SUPABASE_URL=TU_URL_DE_SUPABASE
VITE_SUPABASE_ANON_KEY=TU_ANON_KEY
```

## 4) Probar local
```bash
cmd /c npm run dev -- --host 127.0.0.1 --port 5173
```
Abrí `http://127.0.0.1:5173`, carga datos y refresca.

## 5) Datos que quedan sincronizados
- Productos
- Categorias
- Ofertas
- Pedidos
- Carrito

## 6) Subir a Hostinger
1. Build:
```bash
cmd /c npm run build
```
2. Sube `dist/client` al hosting.
3. Si deployas por Git/CI en Hostinger, define:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 7) Nota importante
Sin variables de Supabase, el sitio funciona solo en modo local del navegador.
Con variables + politicas RLS de arriba, queda persistente en la nube.
