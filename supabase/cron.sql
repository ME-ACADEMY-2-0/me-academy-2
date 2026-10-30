-- Optional scheduled jobs. Run AFTER schema.sql, once the site is live on its domain.
-- 1. Supabase dashboard > Database > Extensions: enable pg_cron and pg_net.
-- 2. Supabase dashboard > Project Settings > Vault: add a secret named cron_secret with the SAME value as CRON_SECRET
--    in Vercel.
-- 3. Replace https://YOUR-DOMAIN below with the live site URL, then run this file in the SQL Editor.

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Housekeeping: keep page views 90 days, visits 13 months, the email log 180 days.
select cron.schedule('prune-old-page-views', '30 2 * * *', $$delete from public.activity_events where type = 'page_view' and created_at < now() - interval '90 days'$$);
select cron.schedule('prune-old-visits', '45 2 * * *', $$delete from public.visits where created_at < now() - interval '13 months'$$);
select cron.schedule('email-log-retention', '30 3 * * *', $$delete from public.email_log where created_at < now() - interval '180 days'$$);

-- Abandoned-checkout reminder emails, every 10 minutes.
select cron.schedule(
  'checkout-reminders',
  '*/10 * * * *',
  $$
  select net.http_get(
    url := 'https://YOUR-DOMAIN/api/cron/checkout-reminders',
    headers := jsonb_build_object('Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret'))
  );
  $$
);
