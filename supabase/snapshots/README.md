# supabase/snapshots

Volcados (`pg_dump`) generados desde el proyecto remoto de Supabase.

**El contenido de esta carpeta está gitignored** — los dumps pueden traer
datos sensibles (emails, IDs internos, configuración). Versionar la fuente
de verdad va en `supabase/migrations/`, no acá.

## Generar un snapshot

Desde la raíz del repo, con el proyecto ya enlazado (`supabase link`):

```powershell
# Schema completo + policies de storage (recomendado para respaldo)
supabase db dump --linked --schema public,storage -f supabase/snapshots/schema.sql

# Solo data (filas), schema aparte
supabase db dump --linked --schema public --data-only -f supabase/snapshots/data.sql

# Todo junto (un solo archivo)
supabase db dump --linked --schema public,storage -f supabase/snapshots/full.sql
```

## Cuándo regenerarlo

- Antes de un cambio grande de schema (rollback artesanal).
- Antes de la sustentación (snapshot oficial).
- Cuando quieras clonar el proyecto a otro Supabase (`psql < schema.sql`).

## Qué NO hacer

- ❌ Commitear el archivo `.sql` resultante.
- ❌ Subir el dump a un drive público o repositorio público.
- ❌ Usar el snapshot como reemplazo de migraciones — sigue siendo el
  histórico en `supabase/migrations/` el que aplica `supabase db push`.
