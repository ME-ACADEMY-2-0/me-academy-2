# Scolar

A white-label e-learning platform for a school, academy or coach. It has a learner app and a full admin. The
brand (name, logos, icon, colours, font, light/dark default) is set from the admin, so each client install
needs no code changes beyond their own pages and legal text.

**Setting up for a client? Follow [docs/SETUP.md](docs/SETUP.md) stage by stage.**

## What's inside

**Learner app**

- Course catalogue and cart.
- Paystack checkout with coupons.
- Video, text and document lessons with progress tracking.
- Quizzes and certificates (publicly verifiable).
- Reviews, badges, a public profile and notifications.
- Refer a friend: welcome coupon for the friend, reward coupon for the referrer.
- Support chat with staff.
- Two-step sign-in, data export and an AI study assistant (optional).
- Installable as an app (PWA).

**Admin**

- Dashboard and users.
- Courses: a builder wizard, categories, quizzes, reviews, students, certificates and metrics.
- Blog, announcements, documents and support chats.
- Visitor tracking, financials and coupons.
- Team roles and an email template editor.
- Settings: branding, platform, learning, features, appearance and security.

**Roles**

| Role | Can do |
| --- | --- |
| super_admin | Everything |
| editor | Content, blog and announcements |
| accountant | Financials and coupons |
| tutor (Instructor) | Builds courses |
| student | Every learner |

## Stack

| Part | Service |
| --- | --- |
| App | Next.js 16 (App Router, cache components) |
| Auth and database | Supabase (Postgres with row-level security) |
| File storage | Cloudflare R2 |
| Email | Resend |
| Payments | Paystack |
| Optional AI | Cloudflare Workers AI |
| Hosting | Vercel |

## Layout

| Path | What |
| --- | --- |
| `supabase/schema.sql` | The whole database in one file. Run once on a new project. |
| `supabase/seed.sql` | Starter course categories |
| `supabase/cron.sql` | Optional scheduled jobs (pg_cron) |
| `supabase/templates/` | Built sign-in email templates (from `scripts/build-auth-templates.ts`) |
| `src/app/(public)` | Public site: home, courses, blog, about, contact, help, cart, checkout |
| `src/app/(app)` | Learner dashboard (`/learn`, `/me`, settings, support) |
| `src/app/(player)` | Course player |
| `src/app/admin` | Admin (`/admin`, sign-in at `/admin/login`) |
| `src/lib/brand.ts`, `src/lib/brand-shared.ts` | Brand loading and the CSS variables it sets |
| `scripts/` | Auth email setup, type generation and the local schema check |

## Local development

```bash
npm install
cp .env.example .env.local   # fill in as docs/SETUP.md describes
npm run dev                  # http://localhost:3010
```

Checks: `npx tsc --noEmit`, `npm run lint` and `bash scripts/verify/check-schema.sh` (needs local Postgres).
