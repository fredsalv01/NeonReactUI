-- Mover IGV % desde literal hardcoded en BoletaPdf hacia config editable.
INSERT INTO config (clave, valor, descripcion) VALUES
  ('igv_pct', '8', 'Porcentaje IGV aplicado a boletas (sin símbolo %)')
ON CONFLICT (clave) DO NOTHING;

NOTIFY pgrst, 'reload schema';
