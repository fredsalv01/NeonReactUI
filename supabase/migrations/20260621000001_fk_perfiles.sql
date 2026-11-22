-- Migración: redirigir FKs de ventas/kardex a perfiles
-- Las FKs originales apuntaban a auth.users, lo cual impedía embeds de PostgREST
-- desde ventas/kardex hacia perfiles. perfiles.id ya tiene FK CASCADE a auth.users,
-- así que la integridad transitiva se mantiene.

BEGIN;

ALTER TABLE ventas DROP CONSTRAINT IF EXISTS ventas_vendido_por_fkey;
ALTER TABLE ventas
  ADD CONSTRAINT ventas_vendido_por_fkey
  FOREIGN KEY (vendido_por) REFERENCES perfiles(id) ON DELETE SET NULL;

ALTER TABLE kardex DROP CONSTRAINT IF EXISTS kardex_usuario_id_fkey;
ALTER TABLE kardex
  ADD CONSTRAINT kardex_usuario_id_fkey
  FOREIGN KEY (usuario_id) REFERENCES perfiles(id) ON DELETE SET NULL;

COMMIT;

NOTIFY pgrst, 'reload schema';
