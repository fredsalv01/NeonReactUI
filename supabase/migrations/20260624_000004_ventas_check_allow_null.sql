-- Fix: el check constraint de ventas.cliente_tipo_doc no permitía NULL.
-- Una cotización sin cliente al convertirse a venta pasa NULL en estos campos
-- y la inserción falla. Relajamos el constraint para permitir NULL.

ALTER TABLE ventas DROP CONSTRAINT IF EXISTS ventas_cliente_tipo_doc_check;

ALTER TABLE ventas
  ADD CONSTRAINT ventas_cliente_tipo_doc_check
  CHECK (cliente_tipo_doc IS NULL
         OR cliente_tipo_doc IN ('RUC', 'DNI', 'CE', 'Pasaporte'));

NOTIFY pgrst, 'reload schema';
