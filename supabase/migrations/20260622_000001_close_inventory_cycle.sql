-- Migración: cierre del ciclo de inventario
-- 1) Crea fn_salida_stock RPC (equivalente a fn_entrada_stock pero para salidas)
-- 2) Actualiza v_equipos_con_stock para exponer vendidos_total
--    derivado de kardex (suma de salidas)
-- 3) NO drop de equipos.stock todavía — el RPC sigue actualizándolo como
--    espejo. Se eliminará en una migración futura una vez confirmado que
--    nada del código lo lee (frontend ya migró a stock_total).
-- 4) NO drop de ventas.cliente_* todavía — sigue el mismo razonamiento.
--    Una vez Sales.jsx use cliente_id end-to-end, se eliminan.

BEGIN;

-- ── fn_salida_stock ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_salida_stock(
  p_equipo_id        text,
  p_cantidad         integer,
  p_motivo           text  DEFAULT 'Salida manual',
  p_almacen_id       uuid  DEFAULT '00000000-0000-0000-0000-000000000001',
  p_referencia_tipo  text  DEFAULT NULL,
  p_referencia_id    uuid  DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stock_actual_alm integer;
  v_stock_antes      integer;
  v_stock_despues    integer;
BEGIN
  IF p_cantidad <= 0 THEN
    RAISE EXCEPTION 'cantidad debe ser > 0';
  END IF;

  -- Lock fila del equipo
  SELECT COALESCE(stock, 0) INTO v_stock_antes
    FROM equipos WHERE id = p_equipo_id FOR UPDATE;
  IF v_stock_antes IS NULL THEN
    RAISE EXCEPTION 'equipo % no existe', p_equipo_id;
  END IF;

  -- Validar stock del almacén específico
  SELECT cantidad INTO v_stock_actual_alm
    FROM stock_almacen
   WHERE equipo_id = p_equipo_id AND almacen_id = p_almacen_id
   FOR UPDATE;

  IF v_stock_actual_alm IS NULL OR v_stock_actual_alm < p_cantidad THEN
    RAISE EXCEPTION 'stock insuficiente en el almacén (disponible: %, solicitado: %)',
      COALESCE(v_stock_actual_alm, 0), p_cantidad;
  END IF;

  v_stock_despues := v_stock_antes - p_cantidad;

  -- Descontar del almacén
  UPDATE stock_almacen
     SET cantidad   = cantidad - p_cantidad,
         updated_at = now()
   WHERE equipo_id = p_equipo_id AND almacen_id = p_almacen_id;

  -- Espejo en stock global
  UPDATE equipos
     SET stock      = v_stock_despues,
         updated_at = now()
   WHERE id = p_equipo_id;

  -- Movimiento kardex
  INSERT INTO kardex (equipo_id, almacen_id, tipo, cantidad,
                      stock_antes, stock_despues, motivo,
                      usuario_id, referencia_tipo, referencia_id)
  VALUES (p_equipo_id, p_almacen_id, 'salida', p_cantidad,
          v_stock_antes, v_stock_despues, p_motivo,
          auth.uid(), p_referencia_tipo, p_referencia_id);
END;
$$;

-- ── Vista v_equipos_con_stock con vendidos_total ────────────────────────
CREATE OR REPLACE VIEW v_equipos_con_stock AS
SELECT
  e.*,
  COALESCE(SUM(s.cantidad), 0) AS stock_total,
  COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'almacen_id',     s.almacen_id,
        'almacen_nombre', a.nombre,
        'cantidad',       s.cantidad,
        'stock_minimo',   s.stock_minimo
      ) ORDER BY a.nombre
    ) FILTER (WHERE s.almacen_id IS NOT NULL),
    '[]'::jsonb
  ) AS stock_por_almacen,
  COALESCE((
    SELECT SUM(k.cantidad)
      FROM kardex k
     WHERE k.equipo_id = e.id AND k.tipo = 'salida'
  ), 0) AS vendidos_total
FROM equipos e
LEFT JOIN stock_almacen s ON s.equipo_id = e.id
LEFT JOIN almacenes a     ON a.id        = s.almacen_id
GROUP BY e.id;

COMMIT;

NOTIFY pgrst, 'reload schema';
