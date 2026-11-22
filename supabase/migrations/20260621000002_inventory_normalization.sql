-- Migración: normalización del modelo de inventario
-- Tablas nuevas: almacenes, stock_almacen, proveedores, clientes, compras, compra_items
-- Cambios en tablas existentes: equipos, ventas, kardex
-- RPC fn_entrada_stock actualizada para soportar multi-almacén
-- Vista v_equipos_con_stock para listados

BEGIN;

-- ── 1. ALMACENES ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS almacenes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre          text NOT NULL,
  direccion       text,
  responsable_id  uuid REFERENCES perfiles(id) ON DELETE SET NULL,
  active          boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

INSERT INTO almacenes (id, nombre)
VALUES ('00000000-0000-0000-0000-000000000001', 'Principal')
ON CONFLICT (id) DO NOTHING;

-- ── 2. PROVEEDORES ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS proveedores (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre        text NOT NULL,
  ruc           text,
  razon_social  text,
  contacto      text,
  telefono      text,
  email         text,
  direccion     text,
  notas         text,
  active        boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS proveedores_ruc_unique
  ON proveedores(ruc)
  WHERE ruc IS NOT NULL AND ruc <> '';

-- ── 3. CLIENTES ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clientes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre        text NOT NULL,
  tipo_doc      text,
  nro_doc       text,
  razon_social  text,
  telefono      text,
  email         text,
  direccion     text,
  notas         text,
  active        boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS clientes_doc_unique
  ON clientes(tipo_doc, nro_doc)
  WHERE tipo_doc IS NOT NULL AND nro_doc IS NOT NULL;

-- ── 4. STOCK POR ALMACÉN + backfill ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS stock_almacen (
  equipo_id     text NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
  almacen_id    uuid NOT NULL REFERENCES almacenes(id) ON DELETE RESTRICT,
  cantidad      integer NOT NULL DEFAULT 0 CHECK (cantidad >= 0),
  stock_minimo  integer NOT NULL DEFAULT 0 CHECK (stock_minimo >= 0),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (equipo_id, almacen_id)
);

CREATE INDEX IF NOT EXISTS stock_almacen_almacen_idx ON stock_almacen(almacen_id);

INSERT INTO stock_almacen (equipo_id, almacen_id, cantidad)
SELECT id, '00000000-0000-0000-0000-000000000001', COALESCE(stock, 0)
FROM equipos
WHERE active = true
ON CONFLICT (equipo_id, almacen_id) DO NOTHING;

-- ── 5. COLUMNAS NUEVAS EN TABLAS EXISTENTES ─────────────────────────────
ALTER TABLE equipos
  ADD COLUMN IF NOT EXISTS proveedor_default_id uuid REFERENCES proveedores(id) ON DELETE SET NULL;

ALTER TABLE ventas
  ADD COLUMN IF NOT EXISTS cliente_id  uuid REFERENCES clientes(id)  ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS almacen_id  uuid REFERENCES almacenes(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS ventas_cliente_idx ON ventas(cliente_id);
CREATE INDEX IF NOT EXISTS ventas_almacen_idx ON ventas(almacen_id);

ALTER TABLE kardex
  ADD COLUMN IF NOT EXISTS almacen_id          uuid REFERENCES almacenes(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS almacen_destino_id  uuid REFERENCES almacenes(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS referencia_tipo     text;

UPDATE kardex SET almacen_id = '00000000-0000-0000-0000-000000000001'
WHERE almacen_id IS NULL;

ALTER TABLE kardex ALTER COLUMN almacen_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS kardex_almacen_idx ON kardex(almacen_id);

-- kardex.referencia_id era bigint → migrar a uuid (preservando data legacy si la hubiera)
DO $$
DECLARE
  v_type  text;
  v_count integer;
BEGIN
  SELECT data_type INTO v_type
    FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'kardex' AND column_name = 'referencia_id';

  IF v_type <> 'uuid' THEN
    SELECT COUNT(*) INTO v_count FROM kardex WHERE referencia_id IS NOT NULL;
    IF v_count > 0 THEN
      ALTER TABLE kardex RENAME COLUMN referencia_id TO referencia_id_legacy;
      ALTER TABLE kardex ADD COLUMN referencia_id uuid;
    ELSE
      ALTER TABLE kardex DROP COLUMN referencia_id;
      ALTER TABLE kardex ADD COLUMN referencia_id uuid;
    END IF;
  END IF;
END $$;

-- ── 6. BACKFILL DE CLIENTES desde ventas.cliente_* ──────────────────────
INSERT INTO clientes (nombre, tipo_doc, nro_doc, telefono, email)
SELECT DISTINCT ON (v.cliente_tipo_doc, v.cliente_nro_doc)
  COALESCE(NULLIF(v.cliente, ''), 'Cliente sin nombre'),
  v.cliente_tipo_doc,
  v.cliente_nro_doc,
  v.cliente_telefono,
  v.cliente_email
FROM ventas v
WHERE v.cliente_tipo_doc IS NOT NULL
  AND v.cliente_nro_doc  IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM clientes c
    WHERE c.tipo_doc = v.cliente_tipo_doc
      AND c.nro_doc  = v.cliente_nro_doc
  );

UPDATE ventas v
SET cliente_id = c.id
FROM clientes c
WHERE v.cliente_id IS NULL
  AND v.cliente_tipo_doc = c.tipo_doc
  AND v.cliente_nro_doc  = c.nro_doc;

UPDATE ventas SET almacen_id = '00000000-0000-0000-0000-000000000001'
WHERE almacen_id IS NULL;

-- ── 7. COMPRAS + COMPRA_ITEMS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS compras (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proveedor_id  uuid REFERENCES proveedores(id) ON DELETE SET NULL,
  almacen_id    uuid NOT NULL REFERENCES almacenes(id) ON DELETE RESTRICT,
  fecha         date NOT NULL DEFAULT CURRENT_DATE,
  total         numeric(12,2) NOT NULL DEFAULT 0,
  notas         text,
  usuario_id    uuid REFERENCES perfiles(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS compras_proveedor_idx ON compras(proveedor_id);
CREATE INDEX IF NOT EXISTS compras_almacen_idx   ON compras(almacen_id);
CREATE INDEX IF NOT EXISTS compras_fecha_idx     ON compras(fecha DESC);

CREATE TABLE IF NOT EXISTS compra_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  compra_id       uuid NOT NULL REFERENCES compras(id) ON DELETE CASCADE,
  equipo_id       text NOT NULL REFERENCES equipos(id) ON DELETE RESTRICT,
  cantidad        integer NOT NULL CHECK (cantidad > 0),
  precio_unitario numeric(12,2) NOT NULL CHECK (precio_unitario >= 0),
  subtotal        numeric(12,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS compra_items_compra_idx ON compra_items(compra_id);
CREATE INDEX IF NOT EXISTS compra_items_equipo_idx ON compra_items(equipo_id);

-- ── 8. RPC fn_entrada_stock (con almacen_id + stock_antes/despues) ──────
DROP FUNCTION IF EXISTS fn_entrada_stock(text, integer, text);
DROP FUNCTION IF EXISTS fn_entrada_stock(text, integer, text, uuid);

CREATE OR REPLACE FUNCTION fn_entrada_stock(
  p_equipo_id  text,
  p_cantidad   integer,
  p_motivo     text DEFAULT 'Entrada manual',
  p_almacen_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stock_antes   integer;
  v_stock_despues integer;
BEGIN
  IF p_cantidad <= 0 THEN
    RAISE EXCEPTION 'cantidad debe ser > 0';
  END IF;

  SELECT COALESCE(stock, 0)
    INTO v_stock_antes
    FROM equipos
   WHERE id = p_equipo_id
   FOR UPDATE;

  IF v_stock_antes IS NULL THEN
    RAISE EXCEPTION 'equipo % no existe', p_equipo_id;
  END IF;

  v_stock_despues := v_stock_antes + p_cantidad;

  INSERT INTO stock_almacen (equipo_id, almacen_id, cantidad)
  VALUES (p_equipo_id, p_almacen_id, p_cantidad)
  ON CONFLICT (equipo_id, almacen_id)
  DO UPDATE SET cantidad   = stock_almacen.cantidad + EXCLUDED.cantidad,
                updated_at = now();

  UPDATE equipos
     SET stock      = v_stock_despues,
         updated_at = now()
   WHERE id = p_equipo_id;

  INSERT INTO kardex (equipo_id, almacen_id, tipo, cantidad,
                      stock_antes, stock_despues, motivo, usuario_id)
  VALUES (p_equipo_id, p_almacen_id, 'entrada', p_cantidad,
          v_stock_antes, v_stock_despues, p_motivo, auth.uid());
END;
$$;

-- ── 9. TRIGGERS de compras ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION trg_compra_item_after_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_almacen_id    uuid;
  v_usuario_id    uuid;
  v_stock_antes   integer;
  v_stock_despues integer;
BEGIN
  SELECT almacen_id, usuario_id INTO v_almacen_id, v_usuario_id
    FROM compras WHERE id = NEW.compra_id;

  SELECT COALESCE(stock, 0) INTO v_stock_antes
    FROM equipos WHERE id = NEW.equipo_id FOR UPDATE;

  v_stock_despues := v_stock_antes + NEW.cantidad;

  INSERT INTO stock_almacen (equipo_id, almacen_id, cantidad)
  VALUES (NEW.equipo_id, v_almacen_id, NEW.cantidad)
  ON CONFLICT (equipo_id, almacen_id)
  DO UPDATE SET cantidad   = stock_almacen.cantidad + EXCLUDED.cantidad,
                updated_at = now();

  UPDATE equipos SET stock = v_stock_despues, updated_at = now()
   WHERE id = NEW.equipo_id;

  INSERT INTO kardex (equipo_id, almacen_id, tipo, cantidad,
                      stock_antes, stock_despues, motivo,
                      usuario_id, referencia_tipo, referencia_id)
  VALUES (NEW.equipo_id, v_almacen_id, 'entrada', NEW.cantidad,
          v_stock_antes, v_stock_despues,
          'Compra ' || NEW.compra_id::text,
          v_usuario_id, 'compra', NEW.compra_id);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS compra_items_after_insert ON compra_items;
CREATE TRIGGER compra_items_after_insert
AFTER INSERT ON compra_items
FOR EACH ROW EXECUTE FUNCTION trg_compra_item_after_insert();

CREATE OR REPLACE FUNCTION trg_recalcular_total_compra()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_compra_id uuid := COALESCE(NEW.compra_id, OLD.compra_id);
BEGIN
  UPDATE compras
     SET total      = (SELECT COALESCE(SUM(subtotal), 0)
                         FROM compra_items WHERE compra_id = v_compra_id),
         updated_at = now()
   WHERE id = v_compra_id;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS compra_items_total_sync ON compra_items;
CREATE TRIGGER compra_items_total_sync
AFTER INSERT OR UPDATE OR DELETE ON compra_items
FOR EACH ROW EXECUTE FUNCTION trg_recalcular_total_compra();

-- updated_at automático
CREATE OR REPLACE FUNCTION trg_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS almacenes_set_updated_at     ON almacenes;
DROP TRIGGER IF EXISTS proveedores_set_updated_at   ON proveedores;
DROP TRIGGER IF EXISTS clientes_set_updated_at      ON clientes;
DROP TRIGGER IF EXISTS stock_almacen_set_updated_at ON stock_almacen;
DROP TRIGGER IF EXISTS compras_set_updated_at       ON compras;

CREATE TRIGGER almacenes_set_updated_at     BEFORE UPDATE ON almacenes     FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();
CREATE TRIGGER proveedores_set_updated_at   BEFORE UPDATE ON proveedores   FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();
CREATE TRIGGER clientes_set_updated_at      BEFORE UPDATE ON clientes      FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();
CREATE TRIGGER stock_almacen_set_updated_at BEFORE UPDATE ON stock_almacen FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();
CREATE TRIGGER compras_set_updated_at       BEFORE UPDATE ON compras       FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

-- ── 10. VISTA AGREGADA v_equipos_con_stock ──────────────────────────────
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
  ) AS stock_por_almacen
FROM equipos e
LEFT JOIN stock_almacen s ON s.equipo_id = e.id
LEFT JOIN almacenes a     ON a.id        = s.almacen_id
GROUP BY e.id;

COMMIT;

NOTIFY pgrst, 'reload schema';
