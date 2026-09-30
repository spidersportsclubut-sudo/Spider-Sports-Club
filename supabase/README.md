# Spider Sports Club — Supabase Setup

Database schema lives in `migrations/0001_initial_schema.sql`.

## 1. Create the Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**.
2. Pick a name (e.g. `spider-sports-club`), a database password, and a region close to you (e.g. US West).
3. Wait for the project to finish provisioning.

## 2. Run the migration

1. In the Supabase dashboard, open **SQL Editor** → **New query**.
2. Copy the entire contents of `migrations/0001_initial_schema.sql` and paste it in.
3. Press **Run**. The script is a safe first-run version: it contains no `DROP`, `DELETE`, or `TRUNCATE` statements — only `CREATE`/`INSERT`, all guarded — so the "destructive operations" warning will not appear. Run it once on a fresh project.
4. You should see `Success`. Verify under **Table Editor** that the tables exist: `profiles`, `teams`, `players`, `events`, `rsvps`, `registrations`, `payments`, `messages`.

The migration also adds the `messages` table to the `supabase_realtime` publication, so team chat updates arrive live in the app. If you ever need to toggle Realtime, it's under **Database → Replication**.

## 3. Wire up the Next.js app

In the project dashboard go to **Project Settings → API** and copy:

- **Project URL**
- **anon public** key

Create `.env.local` in the Next.js app root (never commit this file):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

⚠️ **Never put the `service_role` key in frontend code or `.env.local`.** It bypasses all row-level security and belongs only on the server (the Stripe webhook). More on that below.

## 4. Create users and give them roles

There is no self-serve role signup — roles are assigned manually:

1. **Create the auth user:** Dashboard → **Authentication → Users → Add user → Create new user**. Enter email + password (or use "send invite"). Copy the user's **UUID**.
2. **Insert the matching profile row:** **SQL Editor → New query**, run:
   ```sql
   insert into public.profiles (id, role, full_name)
   values ('PASTE-USER-UUID-HERE', 'admin', 'Full Name');
   ```
   Role must be one of `admin`, `coach`, `parent`, `player`. Use `admin` for yourself first.
3. Repeat for coaches, then assign them to teams:
   ```sql
   update public.teams set coach_id = 'COACH-USER-UUID' where name = 'SSC Boys U14 – Salt Lake City';
   ```

## 5. Realtime (chat)

The migration already runs:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
```

Realtime is enabled for the `messages` table out of the box. The frontend can subscribe with the Supabase JS client to `postgres_changes` on `messages` for live team chat.

## 6. Payments + Stripe webhook

The `payments` table has **no INSERT/UPDATE/DELETE policies** for `anon` or `authenticated` roles, so nobody can write payments from the frontend.

- Payment rows are written **only by the Stripe webhook** running on the server.
- The webhook must use the **`service_role` key**, which bypasses RLS. Store it as a server-only env var (e.g. `SUPABASE_SERVICE_ROLE_KEY`) in your deployment platform (Vercel → Project Settings → Environment Variables) — never in client-side code or the repo.
- `registrations.status` flips from `pending` → `paid` in the same webhook handler after a successful payment.

## Schema overview

| Table | Purpose |
|---|---|
| `profiles` | One row per auth user; `role` ∈ admin/coach/parent/player |
| `teams` | Teams by division + city; `coach_id` links to a coach profile |
| `players` | Roster entries; link to a team and (optionally) a profile |
| `events` | Practices and games with time/location |
| `rsvps` | Player RSVP (`going`/`maybe`/`out`) per event, one per player |
| `registrations` | Public signup form submissions (`pending`/`paid`/`cancelled`) |
| `payments` | Stripe payment records, written by the webhook |
| `messages` | Team chat; Realtime-enabled |

## Cleaning up demo data

The migration seeds 3 demo teams with 2 demo events each (marked `DEMO` in the notes). To remove them later:

```sql
delete from public.teams where name like 'SSC%';
```
