# Spider Sports Club — Web Platform

Full-stack youth soccer club platform: **Next.js 16 (App Router, TypeScript, Tailwind v4)** frontend + **Supabase** (Postgres, Auth, Realtime) backend + **Stripe** for registration fees and seasonal dues.

## Quick start

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase + Stripe keys
npm run dev                  # http://localhost:3000
npm run build                # production build (must pass)
```

## Environment variables

All keys are placeholders until you connect your own accounts — see `.env.example`:

| Variable | Where it comes from |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side only (Stripe webhook). Never expose to the browser. |
| `STRIPE_SECRET_KEY` | Stripe dashboard → Developers → API keys (test mode) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe dashboard (test mode) |
| `STRIPE_WEBHOOK_SECRET` | Stripe dashboard → Developers → Webhooks |

## Database setup

1. Create a project at [supabase.com](https://supabase.com).
2. Open the SQL editor and run `supabase/migrations/0001_initial_schema.sql` (see `supabase/README.md` for the full walkthrough).
3. Create users under Authentication → Users, then add matching rows in `profiles` with a role (`admin`, `coach`, `parent`, `player`).

## Project structure

- `app/` — public pages (`/`, `/programs`, `/cities/[slug]`), `/register`, `/login`, `/dashboard`, API routes (`/api/checkout`, `/api/webhooks/stripe`)
- `components/` — site chrome and dashboard widgets (calendar, RSVP, chat)
- `lib/` — Supabase clients, shared types, real club data (cities, divisions, fees)
- `supabase/migrations/` — Postgres schema + RLS policies + demo seed

## Deployment workflow

1. Code is written and reviewed here.
2. Push to GitHub (Step 2 of the club workflow).
3. Deploy on Vercel — it auto-deploys from the GitHub repo (Step 3).
4. Production deployment triggered.
5. Point `spidersportsclub.com` at Vercel via Squarespace DNS records (Step 4).

## Notes

- Stripe is wired with **placeholder/test mode only**. Swap in your live keys and webhook secret when you are ready to take real payments.
- Without Supabase env vars, public pages render with demo data and the dashboard shows a setup notice instead of crashing.
