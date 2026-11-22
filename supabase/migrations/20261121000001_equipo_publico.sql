-- Ficha pública del QR (/p/equipo/:id) — sin login.
-- Solo info general del producto: NADA de stock, precios, proveedor ni almacenes.
--
-- Antes la página leía v_equipos_con_stock con la anon key, así que cualquiera
-- podía pedir select=* (stock, precio_compra, ...) aunque la UI no lo mostrara.
-- Ahora anon solo pasa por esta función, que devuelve columnas fijas.

BEGIN;

CREATE OR REPLACE FUNCTION fn_equipo_publico(p_id text)
RETURNS TABLE (id text, nombre text, tipo text, imagen_url text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT e.id, e.nombre, e.tipo, e.imagen_url
    FROM equipos e
   WHERE e.id = p_id
     AND e.active IS TRUE
$$;

ALTER FUNCTION fn_equipo_publico(text) OWNER TO postgres;  -- SECURITY DEFINER: corre como su dueño
REVOKE ALL ON FUNCTION fn_equipo_publico(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION fn_equipo_publico(text) TO anon, authenticated;

-- Sin sesión no se lee ni se escribe stock/precios directo. `authenticated` no se toca.
-- (stock_almacen no tiene RLS: con el grant por defecto, anon podía hasta borrar stock)
-- ponytail: solo objetos de inventario; el resto de tablas sigue con el grant
-- por defecto de Supabase a anon → cerrar en bloque cuando entre RLS.
REVOKE ALL ON v_equipos_con_stock, equipos, stock_almacen, kardex FROM anon;

COMMIT;

NOTIFY pgrst, 'reload schema';
