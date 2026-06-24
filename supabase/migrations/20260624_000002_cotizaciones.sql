-- Migración: Cotizaciones (master-detail) + flujo de conversión a venta
-- 1) cotizaciones (header)
-- 2) cotizaciones_items (detalle normalizado, mismo patrón que venta_items)
-- 3) Trigger trg_recalcular_total_cotizacion (SUM de subtotales)
-- 4) RLS: lectura authenticated, escritura Admin/Ventas
-- 5) RPC fn_registrar_cotizacion — UNA transacción que inserta header + items
-- 6) RPC fn_convertir_cotizacion_a_venta — reusa fn_registrar_venta y marca convertida

BEGIN;

-- ── 1. cotizaciones ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cotizaciones (
  id               bigserial PRIMARY KEY,
  cliente_id       uuid REFERENCES clientes(id) ON DELETE SET NULL,
  usuario_id       uuid REFERENCES auth.users(id),
  -- snapshot legacy denormalizado (igual que ventas)
  cliente          text,
  cliente_tipo_doc text,
  cliente_nro_doc  text,
  cliente_telefono text,
  cliente_email    text,
  fecha            date NOT NULL DEFAULT CURRENT_DATE,
  notas            text,
  total            numeric(12,2) NOT NULL DEFAULT 0,
  estado           text NOT NULL DEFAULT 'borrador'
                     CHECK (estado IN ('borrador','enviada','aceptada','rechazada','convertida')),
  venta_id         int8 REFERENCES ventas(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cotizaciones_estado_idx     ON cotizaciones(estado);
CREATE INDEX IF NOT EXISTS cotizaciones_cliente_idx    ON cotizaciones(cliente_id);
CREATE INDEX IF NOT EXISTS cotizaciones_created_at_idx ON cotizaciones(created_at DESC);

-- ── 2. cotizaciones_items ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cotizaciones_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cotizacion_id   int8 NOT NULL REFERENCES cotizaciones(id) ON DELETE CASCADE,
  equipo_id       text NOT NULL REFERENCES equipos(id) ON DELETE RESTRICT,
  cantidad        integer NOT NULL CHECK (cantidad > 0),
  precio_unitario numeric(12,2) NOT NULL CHECK (precio_unitario >= 0),
  subtotal        numeric(12,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cot_items_cot_idx    ON cotizaciones_items(cotizacion_id);
CREATE INDEX IF NOT EXISTS cot_items_equipo_idx ON cotizaciones_items(equipo_id);

-- ── 3. Trigger recalcular total ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION trg_recalcular_total_cotizacion()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  v_cot_id int8;
BEGIN
  v_cot_id := COALESCE(NEW.cotizacion_id, OLD.cotizacion_id);
  UPDATE cotizaciones
     SET total      = (SELECT COALESCE(SUM(subtotal), 0)
                         FROM cotizaciones_items WHERE cotizacion_id = v_cot_id),
         updated_at = now()
   WHERE id = v_cot_id;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS cot_items_total_sync ON cotizaciones_items;
CREATE TRIGGER cot_items_total_sync
AFTER INSERT OR UPDATE OR DELETE ON cotizaciones_items
FOR EACH ROW EXECUTE FUNCTION trg_recalcular_total_cotizacion();

-- ── 4. RLS ──────────────────────────────────────────────────────────────
ALTER TABLE cotizaciones        ENABLE ROW LEVEL SECURITY;
ALTER TABLE cotizaciones_items  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cot_read  ON cotizaciones;
DROP POLICY IF EXISTS cot_write ON cotizaciones;
DROP POLICY IF EXISTS cot_items_read  ON cotizaciones_items;
DROP POLICY IF EXISTS cot_items_write ON cotizaciones_items;

CREATE POLICY cot_read       ON cotizaciones        FOR SELECT TO authenticated USING (true);
CREATE POLICY cot_items_read ON cotizaciones_items  FOR SELECT TO authenticated USING (true);

CREATE POLICY cot_write ON cotizaciones FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM perfiles p JOIN roles r ON r.id = p.rol_id
    WHERE p.id = auth.uid() AND r.nombre IN ('Administrador','Ventas')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM perfiles p JOIN roles r ON r.id = p.rol_id
    WHERE p.id = auth.uid() AND r.nombre IN ('Administrador','Ventas')
  ));

CREATE POLICY cot_items_write ON cotizaciones_items FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM perfiles p JOIN roles r ON r.id = p.rol_id
    WHERE p.id = auth.uid() AND r.nombre IN ('Administrador','Ventas')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM perfiles p JOIN roles r ON r.id = p.rol_id
    WHERE p.id = auth.uid() AND r.nombre IN ('Administrador','Ventas')
  ));

-- ── 5. RPC fn_registrar_cotizacion ──────────────────────────────────────
-- p_cotizacion : { cliente_id, usuario_id, fecha, notas }
-- p_items      : [{ equipo_id, cantidad, precio_unitario }, ...]
DROP FUNCTION IF EXISTS fn_registrar_cotizacion(jsonb, jsonb);

CREATE OR REPLACE FUNCTION fn_registrar_cotizacion(
  p_cotizacion jsonb,
  p_items      jsonb
) RETURNS int8
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cot_id      int8;
  v_cliente_id  uuid;
  v_cliente_row clientes%ROWTYPE;
  v_item        jsonb;
BEGIN
  IF jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'cotizacion debe tener al menos un item';
  END IF;

  v_cliente_id := NULLIF(p_cotizacion->>'cliente_id', '')::uuid;

  IF v_cliente_id IS NOT NULL THEN
    SELECT * INTO v_cliente_row FROM clientes WHERE id = v_cliente_id;
  END IF;

  INSERT INTO cotizaciones (
    cliente_id, usuario_id, fecha, notas,
    cliente, cliente_tipo_doc, cliente_nro_doc, cliente_telefono, cliente_email
  ) VALUES (
    v_cliente_id,
    NULLIF(p_cotizacion->>'usuario_id','')::uuid,
    COALESCE((p_cotizacion->>'fecha')::date, CURRENT_DATE),
    NULLIF(p_cotizacion->>'notas',''),
    COALESCE(v_cliente_row.nombre, NULLIF(p_cotizacion->>'cliente','')),
    v_cliente_row.tipo_doc,
    v_cliente_row.nro_doc,
    v_cliente_row.telefono,
    v_cliente_row.email
  )
  RETURNING id INTO v_cot_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO cotizaciones_items (cotizacion_id, equipo_id, cantidad, precio_unitario)
    VALUES (
      v_cot_id,
      v_item->>'equipo_id',
      (v_item->>'cantidad')::int,
      (v_item->>'precio_unitario')::numeric
    );
  END LOOP;

  RETURN v_cot_id;
END;
$$;

GRANT EXECUTE ON FUNCTION fn_registrar_cotizacion(jsonb, jsonb) TO authenticated;

-- ── 6. RPC fn_convertir_cotizacion_a_venta ──────────────────────────────
-- Convierte una cotizacion aceptada (o borrador/enviada) en venta:
--   1) Lee items
--   2) Llama fn_registrar_venta (inserta venta + items + descuenta stock + kardex)
--   3) Marca la cotizacion como 'convertida' con venta_id
DROP FUNCTION IF EXISTS fn_convertir_cotizacion_a_venta(int8, uuid);

CREATE OR REPLACE FUNCTION fn_convertir_cotizacion_a_venta(
  p_cotizacion_id int8,
  p_almacen_id    uuid
) RETURNS int8
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cot           cotizaciones%ROWTYPE;
  v_venta_id      int8;
  v_venta_payload jsonb;
  v_items_payload jsonb;
BEGIN
  SELECT * INTO v_cot FROM cotizaciones WHERE id = p_cotizacion_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'cotizacion % no encontrada', p_cotizacion_id;
  END IF;
  IF v_cot.estado = 'convertida' THEN
    RAISE EXCEPTION 'cotizacion ya fue convertida (venta %)', v_cot.venta_id;
  END IF;
  IF v_cot.estado = 'rechazada' THEN
    RAISE EXCEPTION 'cotizacion rechazada no puede convertirse';
  END IF;
  IF p_almacen_id IS NULL THEN
    RAISE EXCEPTION 'almacen_id requerido para convertir a venta';
  END IF;

  SELECT jsonb_agg(jsonb_build_object(
           'equipo_id',       equipo_id,
           'cantidad',        cantidad,
           'precio_unitario', precio_unitario
         ))
    INTO v_items_payload
    FROM cotizaciones_items
   WHERE cotizacion_id = p_cotizacion_id;

  IF v_items_payload IS NULL OR jsonb_array_length(v_items_payload) = 0 THEN
    RAISE EXCEPTION 'cotizacion sin items, no puede convertirse';
  END IF;

  v_venta_payload := jsonb_build_object(
    'cliente_id',  v_cot.cliente_id,
    'almacen_id',  p_almacen_id,
    'vendido_por', v_cot.usuario_id,
    'fecha',       CURRENT_DATE,
    'notas',       'Conversión de cotización #' || v_cot.id::text
  );

  v_venta_id := fn_registrar_venta(v_venta_payload, v_items_payload);

  UPDATE cotizaciones
     SET estado     = 'convertida',
         venta_id   = v_venta_id,
         updated_at = now()
   WHERE id = p_cotizacion_id;

  RETURN v_venta_id;
END;
$$;

GRANT EXECUTE ON FUNCTION fn_convertir_cotizacion_a_venta(int8, uuid) TO authenticated;

COMMIT;

NOTIFY pgrst, 'reload schema';
