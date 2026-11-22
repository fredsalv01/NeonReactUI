-- Fix: el check constraint de ventas.cliente_tipo_doc no permitía NULL.
-- Una cotización sin cliente al convertirse a venta pasa NULL en estos campos
-- y la inserción falla. Relajamos el constraint para permitir NULL.
--
-- Filas existentes podrían tener '' (cadena vacía) o valores fuera del set,
-- por lo que normalizamos a NULL antes de re-agregar el constraint.

BEGIN;

-- 1) Quita constraint vigente (si existe)
ALTER TABLE ventas DROP CONSTRAINT IF EXISTS ventas_cliente_tipo_doc_check;

-- 2) Normaliza filas problemáticas
UPDATE ventas
   SET cliente_tipo_doc = NULL
 WHERE cliente_tipo_doc IS NOT NULL
   AND cliente_tipo_doc NOT IN ('RUC', 'DNI', 'CE', 'Pasaporte');

-- 3) Re-agrega constraint permitiendo NULL
ALTER TABLE ventas
  ADD CONSTRAINT ventas_cliente_tipo_doc_check
  CHECK (cliente_tipo_doc IS NULL
         OR cliente_tipo_doc IN ('RUC', 'DNI', 'CE', 'Pasaporte'));

COMMIT;

NOTIFY pgrst, 'reload schema';
