#!/usr/bin/env bash
# Applies supabase/schema.sql + seed.sql to a throwaway local Postgres database, so you can confirm the schema
# is valid before running it on a real Supabase project. Needs a local Postgres (psql + createdb on PATH).
#   bash scripts/verify/check-schema.sh            uses database "scolar_check"
#   PGPORT=5433 bash scripts/verify/check-schema.sh
set -euo pipefail
cd "$(dirname "$0")/../.."
DB="${DB:-scolar_check}"
for r in anon authenticated service_role; do
  psql -d postgres -qtc "select 1 from pg_roles where rolname='$r'" | grep -q 1 || psql -d postgres -qc "create role $r"
done
dropdb --if-exists "$DB"
createdb "$DB"
psql -d "$DB" -v ON_ERROR_STOP=1 -q -f scripts/verify/stubs.sql
psql -d "$DB" -v ON_ERROR_STOP=1 -q -f supabase/schema.sql
psql -d "$DB" -v ON_ERROR_STOP=1 -q -f supabase/seed.sql
echo "OK: $(psql -d "$DB" -tAc "select count(*) from information_schema.tables where table_schema='public'") tables, $(psql -d "$DB" -tAc "select count(*) from public.course_categories") categories."
dropdb "$DB"
