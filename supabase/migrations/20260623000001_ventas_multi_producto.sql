-- Migración: ventas multi-producto (master-detail)
-- 1) Tabla `venta_items` (espejo simétrico de compra_items)
-- 2) Columna `fecha` en ventas
-- 3) Trigger trg_recalcular_total_venta (SUM de subtotales)
-- 4) RPC fn_registrar_venta — UNA transacción que inserta venta + items
--    + descuenta stock_almacen + escribe kardex (uno por item)
-- 5) NO se dropean columnas legacy de ventas (equipo_id, cantidad, precio_venta,
--    cliente, cliente_*) — siguen NOT NULL para no romper la app actual.
--    El RPC las rellena con valores del primer item / cliente seleccionado.

BEGIN;

-- ── 1. venta_items ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS venta_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venta_id        int8 NOT NULL REFERENCES ventas(id)  ON DELETE CASCADE,
  equipo_id       text NOT NULL REFERENCES equipos(id) ON DELETE RESTRICT,
  cantidad        integer NOT NULL CHECK (cantidad > 0),
  precio_unitario numeric(12,2) NOT NULL CHECK (precio_unitario >= 0),
  subtotal        numeric(12,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS venta_items_venta_idx  ON venta_items(venta_id);
CREATE INDEX IF NOT EXISTS venta_items_equipo_idx ON venta_items(equipo_id);

-- ── 2. ventas.fecha ─────────────────────────────────────────────────────
ALTER TABLE ventas
  ADD COLUMN IF NOT EXISTS fecha date NOT NULL DEFAULT CURRENT_DATE;

-- ── 3. Trigger recalcular total ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION trg_recalcular_total_venta()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  v_venta_id int8;
BEGIN
  v_venta_id := COALESCE(NEW.venta_id, OLD.venta_id);
  UPDATE ventas
     SET total      = (SELECT COALESCE(SUM(subtotal), 0)
                         FROM venta_items WHERE venta_id = v_venta_id),
         updated_at = now()
   WHERE id = v_venta_id;
  RETURN NULL;
END;
$$;

-- ⚠️ `ventas.total` actualmente es generated column. El trigger NO puede
--    escribirla mientras siga generated. Solución: convertir a columna normal
--    con valor inicial 0; el trigger toma el control desde venta_items.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ventas'
      AND column_name = 'total'
      AND is_generated = 'ALWAYS'
  ) THEN
    ALTER TABLE ventas ALTER COLUMN total DROP EXPRESSION;
    ALTER TABLE ventas ALTER COLUMN total SET DEFAULT 0;
  END IF;
END $$;

DROP TRIGGER IF EXISTS venta_items_total_sync ON venta_items;
CREATE TRIGGER venta_items_total_sync
AFTER INSERT OR UPDATE OR DELETE ON venta_items
FOR EACH ROW EXECUTE FUNCTION trg_recalcular_total_venta();

-- ── 4. RPC fn_registrar_venta ───────────────────────────────────────────
-- p_venta : { cliente_id, almacen_id, vendido_por, notas, fecha }
-- p_items : [{ equipo_id, cantidad, precio_unitario }, ...]
DROP FUNCTION IF EXISTS fn_registrar_venta(jsonb, jsonb);

CREATE OR REPLACE FUNCTION fn_registrar_venta(
  p_venta jsonb,
  p_items jsonb
) RETURNS int8
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_venta_id      int8;
  v_cliente_id    uuid;
  v_almacen_id    uuid;
  v_cliente_row   clientes%ROWTYPE;
  v_item          jsonb;
  v_first         jsonb;
BEGIN
  IF jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'venta debe tener al menos un item';
  END IF;

  v_cliente_id := NULLIF(p_venta->>'cliente_id', '')::uuid;
  v_almacen_id := COALESCE(NULLIF(p_venta->>'almacen_id','')::uuid,
                           '00000000-0000-0000-0000-000000000001'::uuid);

  IF v_cliente_id IS NOT NULL THEN
    SELECT * INTO v_cliente_row FROM clientes WHERE id = v_cliente_id;
  END IF;

  -- Primer item alimenta las columnas legacy (equipo_id, cantidad, precio_venta)
  v_first := p_items->0;

  INSERT INTO ventas (
    cliente_id, almacen_id, vendido_por, fecha, notas,
    -- legacy NOT NULL
    equipo_id, cantidad, precio_venta,
    cliente, cliente_tipo_doc, cliente_nro_doc, cliente_telefono, cliente_email
  ) VALUES (
    v_cliente_id,
    v_almacen_id,
    NULLIF(p_venta->>'vendido_por','')::uuid,
    COALESCE((p_venta->>'fecha')::date, CURRENT_DATE),
    NULLIF(p_venta->>'notas',''),
    v_first->>'equipo_id',
    (v_first->>'cantidad')::int,
    (v_first->>'precio_unitario')::numeric,
    COALESCE(v_cliente_row.nombre, 'Cliente sin nombre'),
    v_cliente_row.tipo_doc,
    v_cliente_row.nro_doc,
    v_cliente_row.telefono,
    v_cliente_row.email
  )
  RETURNING id INTO v_venta_id;

  -- Items + descuento de stock + kardex (una row por item)
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO venta_items (venta_id, equipo_id, cantidad, precio_unitario)
    VALUES (
      v_venta_id,
      v_item->>'equipo_id',
      (v_item->>'cantidad')::int,
      (v_item->>'precio_unitario')::numeric
    );

    PERFORM fn_salida_stock(
      p_equipo_id       := v_item->>'equipo_id',
      p_cantidad        := (v_item->>'cantidad')::int,
      p_motivo          := 'Venta ' || v_venta_id::text,
      p_almacen_id      := v_almacen_id,
      p_referencia_tipo := 'venta',
      p_referencia_id   := NULL
    );
  END LOOP;

  RETURN v_venta_id;
END;
$$;

GRANT EXECUTE ON FUNCTION fn_registrar_venta(jsonb, jsonb) TO authenticated;

COMMIT;

NOTIFY pgrst, 'reload schema';
