-- Migración: ventas.updated_at faltante
-- El trigger trg_recalcular_total_venta intenta escribir updated_at,
-- pero la tabla legacy `ventas` nunca tuvo esa columna.

ALTER TABLE ventas
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

NOTIFY pgrst, 'reload schema';
