-- ─────────────────────────────────────────────────────────────────
-- Bucket privado "reportes" para reportes gerenciales (kardex, etc.)
-- Acceso restringido a Administrador y Almacén; descarga vía
-- signed URL temporal.
-- ─────────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('reportes', 'reportes', false)
on conflict (id) do nothing;

-- Subir solo Admin/Almacén, solo dentro de carpetas conocidas
drop policy if exists "reportes_kardex_insert" on storage.objects;
create policy "reportes_kardex_insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'reportes'
  and (storage.foldername(name))[1] in ('kardex')
  and exists (
    select 1 from perfiles p
    join roles r on r.id = p.rol_id
    where p.id = auth.uid()
      and r.nombre in ('Administrador', 'Almacén')
  )
);

-- Leer solo Admin/Almacén (signed URL respeta esta policy)
drop policy if exists "reportes_kardex_select" on storage.objects;
create policy "reportes_kardex_select"
on storage.objects for select
to authenticated
using (
  bucket_id = 'reportes'
  and exists (
    select 1 from perfiles p
    join roles r on r.id = p.rol_id
    where p.id = auth.uid()
      and r.nombre in ('Administrador', 'Almacén')
  )
);
