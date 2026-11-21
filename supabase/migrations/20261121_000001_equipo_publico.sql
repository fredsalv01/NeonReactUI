-- Ficha pública del QR (/p/equipo/:id) — sin login.
-- Solo info general del producto: NADA de stock, precios, proveedor ni almacenes.
--
-- Antes la página leía v_equipos_con_stock con la anon key, así que cualquiera
-- podía pedir select=* (stock, precio_compra, ...) aunque la UI no lo mostrara.
-- Ahora anon solo pasa por esta función, que devuelve columnas fijas.

BEGIN;

CREATE OR REPLACE FUNCTION fn_equipo_publico(p_id text)
RETURNS TABLE (id text, nombre text, tipo text, descripcion text, imagen_url text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT e.id::text, e.nombre::text, e.tipo::text, e.descripcion::text, e.imagen_url::text
    FROM equipos e
   WHERE e.id = p_id
     AND e.active IS TRUE
$$;

REVOKE ALL ON FUNCTION fn_equipo_publico(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION fn_equipo_publico(text) TO anon, authenticated;

-- Sin sesión no se lee stock ni precios directo. `authenticated` no se toca.
-- ponytail: solo objetos de inventario; el resto de tablas sigue con el grant
-- por defecto de Supabase a anon → cerrar en bloque cuando entre RLS.
REVOKE SELECT ON v_equipos_con_stock, equipos, stock_almacen, kardex FROM anon;

COMMIT;

NOTIFY pgrst, 'reload schema';
