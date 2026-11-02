<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## ME Academy project rules

ME Academy 2.0 is an e-learning platform. Setup steps are in docs/SETUP.md.

- **Brand is data, not code.** Name, logos, icon, colours, font and default theme live in `platform_settings` and
  load through `getBrand()` (`src/lib/brand.ts`, cached under the `brand` tag). Never hardcode a client name or hex
  colour. In CSS use `var(--brand)`, `--brand-fg`, `--brand-strong`, `--brand-deep`, `--brand-soft` and
  `--brand-pale`. In emails use the `{{brand}}`, `{{brand_color}}` and `{{brand_header}}` tokens.
- **Files go to Cloudflare R2** (`src/lib/r2.ts`, upload kinds in `src/lib/upload-safety.ts`). Use Supabase for auth
  and the database only, never Supabase Storage.
- **Schema.** `supabase/schema.sql` is the full database. Client-specific changes go in `supabase/migrations/NNNN_*.sql`.
  After any schema change, regenerate `src/lib/database.types.ts`:
  `psql -tA -f scripts/schema.sql > schema.json && python3 scripts/gen-types.py schema.json`.
- **Next.js 16 with cacheComponents.** Data reads outside `<Suspense>` need `"use cache"` or `await connection()`.
  After a write, call `updateTag(...)` so the change is visible on the next read.
- **Style.**
  - Solid fills only, no translucent tints.
  - Full-width layouts.
  - No em-dashes in copy, UI text or comments.
