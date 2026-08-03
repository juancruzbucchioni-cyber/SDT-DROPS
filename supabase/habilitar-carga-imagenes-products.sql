-- SDT DROPS: habilitar la carga de imágenes desde el panel administrador.
-- Ejecutar una sola vez en Supabase > SQL Editor.

insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do update
set public = true;

drop policy if exists "SDT public read products" on storage.objects;
create policy "SDT public read products"
on storage.objects
for select
to public
using (bucket_id = 'products');

drop policy if exists "SDT anon insert products" on storage.objects;
create policy "SDT anon insert products"
on storage.objects
for insert
to anon
with check (bucket_id = 'products');

drop policy if exists "SDT anon update products" on storage.objects;
create policy "SDT anon update products"
on storage.objects
for update
to anon
using (bucket_id = 'products')
with check (bucket_id = 'products');

