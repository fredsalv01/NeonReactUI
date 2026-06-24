-- Fix: cotizaciones.usuario_id apuntaba a auth.users(id), pero PostgREST
-- necesita FK a perfiles(id) para resolver el embed `perfiles:usuario_id(...)`.
-- Mismo patrón que ventas.vendido_por y kardex.usuario_id.

ALTER TABLE cotizaciones DROP CONSTRAINT IF EXISTS cotizaciones_usuario_id_fkey;

ALTER TABLE cotizaciones
  ADD CONSTRAINT cotizaciones_usuario_id_fkey
  FOREIGN KEY (usuario_id) REFERENCES perfiles(id) ON DELETE SET NULL;

NOTIFY pgrst, 'reload schema';
