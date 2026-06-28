-- Programa la edge function predict-stock mensualmente (día 1, 09:00 hora servidor).
-- Requiere extensiones pg_cron y pg_net habilitadas (Dashboard → Database → Extensions).
-- El service-role key se lee desde Vault para no hardcodearlo aquí.

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Guardar el service-role key en Vault una sola vez desde el SQL editor:
--   select vault.create_secret('REEMPLAZAR_CON_SERVICE_ROLE_KEY', 'service_role_key');
-- Y la URL del proyecto:
--   select vault.create_secret('https://uyidjqigvhstmeuomnwp.supabase.co', 'project_url');

select cron.unschedule('predict-stock-monthly')
where exists (select 1 from cron.job where jobname = 'predict-stock-monthly');

select cron.schedule(
  'predict-stock-monthly',
  '0 9 1 * *',
  $$
  select net.http_post(
    url     := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/predict-stock',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key')
    ),
    body    := '{}'::jsonb
  );
  $$
);
