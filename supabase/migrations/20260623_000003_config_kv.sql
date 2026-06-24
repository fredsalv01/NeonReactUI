-- Tabla key/value de configuración global (single-tenant Geotop).
-- Pensada para crecer: agrega filas, no migra.

CREATE TABLE IF NOT EXISTS config (
  clave        text PRIMARY KEY,
  valor        text,
  descripcion  text,
  updated_at   timestamptz NOT NULL DEFAULT now(),
  updated_by   uuid REFERENCES auth.users(id)
);

ALTER TABLE config ENABLE ROW LEVEL SECURITY;

-- Lectura: cualquier usuario autenticado.
DROP POLICY IF EXISTS config_read ON config;
CREATE POLICY config_read ON config
  FOR SELECT TO authenticated USING (true);

-- Escritura: solo Administrador (perfiles.rol_id → roles.nombre).
DROP POLICY IF EXISTS config_write ON config;
CREATE POLICY config_write ON config
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM perfiles p
    JOIN roles r ON r.id = p.rol_id
    WHERE p.id = auth.uid() AND r.nombre = 'Administrador'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM perfiles p
    JOIN roles r ON r.id = p.rol_id
    WHERE p.id = auth.uid() AND r.nombre = 'Administrador'
  ));

-- Seed: claves que la app espera. Valores vacíos = pendientes de llenar
-- desde Settings. on conflict do nothing → re-correr la migración no pisa edits.
INSERT INTO config (clave, valor, descripcion) VALUES
  ('empresa_razon_social', 'Geotop Perú S.A.C.',                                       'Razón social mostrada en boletas'),
  ('empresa_ruc',          '',                                                          'RUC de la empresa'),
  ('empresa_direccion',    'Miraflores, Lima',                                          'Dirección fiscal'),
  ('empresa_telefono',     '',                                                          'Teléfono comercial'),
  ('empresa_email',        '',                                                          'Email comercial'),
  ('boleta_pie',           'Documento generado por GeoStock — gracias por su compra.',  'Texto al pie de la boleta')
ON CONFLICT (clave) DO NOTHING;

NOTIFY pgrst, 'reload schema';
