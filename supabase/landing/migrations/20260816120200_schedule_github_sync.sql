-- Agenda la sincronizacion diaria de GitHub.
--
-- El secreto NO va escrito en este archivo: se lee de Supabase Vault en cada
-- ejecucion. Antes de correr esta migracion hay que guardarlo una vez:
--
--   select vault.create_secret('<valor-generado>', 'github_sync_cron_secret');
--
-- y ese mismo valor se configura como secret GITHUB_SYNC_CRON_SECRET de la
-- Edge Function.

select cron.unschedule('landingosoria-sync-github')
where exists (select 1 from cron.job where jobname = 'landingosoria-sync-github');

select cron.schedule(
  'landingosoria-sync-github',
  '30 6 * * *',
  $$
  select net.http_post(
    url := 'https://feqsjdhcsrksvrfsjsfv.supabase.co/functions/v1/sync-github',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (
        select decrypted_secret from vault.decrypted_secrets
        where name = 'github_sync_cron_secret'
      )
    ),
    body := '{}'::jsonb
  );
  $$
);
