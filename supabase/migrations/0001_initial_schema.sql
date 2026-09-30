-- ============================================================
-- Spider Sports Club — Initial Schema (Postgres 15 / Supabase)
-- Migration 0001: tables, RLS policies, helper functions, demo seed
--
-- SAFE FIRST-RUN VERSION: this script contains NO destructive
-- statements. There are no DROP, DELETE, or TRUNCATE commands —
-- only CREATE / INSERT / ALTER ... ENABLE, all guarded so the
-- script is safe to paste into the Supabase SQL Editor and run
-- on a fresh project. Run it once; do not re-run unless a
-- policy was deleted manually (re-running would simply report
-- "policy already exists" errors, which are harmless).
-- ============================================================

-- -------------------------
-- 0. Extensions
-- -------------------------
create extension if not exists "pgcrypto";

-- ============================================================
-- 1. TABLES
-- ============================================================

-- User profiles, one row per auth.users entry
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  role       text not null default 'parent'
             check (role in ('admin','coach','parent','player')),
  full_name  text,
  created_at timestamptz not null default now()
);

-- Teams (e.g. Boys U14, Girls U12)
create table if not exists public.teams (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  division    text not null,
  city        text not null,
  coach_id    uuid references public.profiles(id) on delete set null,
  max_players int  not null default 18,
  created_at  timestamptz not null default now()
);

-- Players (roster entries; profile_id is nullable until the player links an account)
create table if not exists public.players (
  id               uuid primary key default gen_random_uuid(),
  profile_id       uuid references public.profiles(id) on delete set null,
  team_id          uuid references public.teams(id) on delete cascade,
  jersey_number    int,
  position         text,
  evaluation_score int check (evaluation_score between 0 and 15),
  created_at       timestamptz not null default now()
);

-- Events (practices and games)
create table if not exists public.events (
  id         uuid primary key default gen_random_uuid(),
  team_id    uuid references public.teams(id) on delete cascade,
  type       text not null check (type in ('practice','game')),
  starts_at  timestamptz not null,
  ends_at    timestamptz,
  location   text,
  notes      text,
  created_at timestamptz not null default now()
);

-- RSVPs per player per event
create table if not exists public.rsvps (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references public.events(id) on delete cascade,
  player_id  uuid not null references public.players(id) on delete cascade,
  status     text not null check (status in ('going','maybe','out')),
  created_at timestamptz not null default now(),
  unique (event_id, player_id)
);

-- Public signup registrations (written by the registration form)
create table if not exists public.registrations (
  id                 uuid primary key default gen_random_uuid(),
  player_name        text not null,
  division           text not null,
  team_id            uuid references public.teams(id) on delete set null,
  parent_name        text,
  parent_email       text not null,
  parent_phone       text,
  agreement_accepted boolean not null default false,
  status             text not null default 'pending'
                     check (status in ('pending','paid','cancelled')),
  stripe_session_id  text,
  created_at         timestamptz not null default now()
);

-- Payments (written by the Stripe webhook with the service-role key)
create table if not exists public.payments (
  id                       uuid primary key default gen_random_uuid(),
  registration_id          uuid not null references public.registrations(id) on delete cascade,
  amount_cents             int not null,
  currency                 text not null default 'usd',
  status                   text not null default 'pending'
                           check (status in ('pending','succeeded','failed')),
  stripe_payment_intent_id text,
  created_at               timestamptz not null default now()
);

-- Team chat messages (Realtime enabled below)
create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  team_id    uuid not null references public.teams(id) on delete cascade,
  sender_id  uuid references public.profiles(id) on delete set null,
  body       text not null,
  created_at timestamptz not null default now()
);

-- Helpful indexes
create index if not exists players_team_id_idx       on public.players (team_id);
create index if not exists events_team_starts_idx    on public.events (team_id, starts_at);
create index if not exists rsvps_event_id_idx       on public.rsvps (event_id);
create index if not exists rsvps_player_id_idx      on public.rsvps (player_id);
create index if not exists registrations_team_idx   on public.registrations (team_id);
create index if not exists payments_registration_idx on public.payments (registration_id);
create index if not exists messages_team_created_idx on public.messages (team_id, created_at);

-- ============================================================
-- 2. HELPER FUNCTIONS
-- ============================================================

-- Returns true when the calling user is an admin. SECURITY DEFINER
-- so it can read public.profiles without triggering RLS recursion.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Returns true when the calling user coaches the given team.
create or replace function public.is_team_coach(p_team_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.teams
    where id = p_team_id and coach_id = auth.uid()
  );
$$;

-- ============================================================
-- 3. ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles      enable row level security;
alter table public.teams         enable row level security;
alter table public.players       enable row level security;
alter table public.events        enable row level security;
alter table public.rsvps         enable row level security;
alter table public.registrations enable row level security;
alter table public.payments      enable row level security;
alter table public.messages      enable row level security;

-- -------------------------
-- profiles
-- -------------------------
create policy "profiles_select_own_or_admin"
on public.profiles for select
using (id = auth.uid() or public.is_admin());

create policy "profiles_update_own_or_admin"
on public.profiles for update
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

-- -------------------------
-- teams  (public read for the website; coaches manage their own; admins all)
-- -------------------------
create policy "teams_public_select"
on public.teams for select to anon, authenticated
using (true);

create policy "teams_coach_manage"
on public.teams for all
using (coach_id = auth.uid() or public.is_admin())
with check (coach_id = auth.uid() or public.is_admin());

-- -------------------------
-- events  (public read; coaches of the team manage; admins all)
-- -------------------------
create policy "events_public_select"
on public.events for select to anon, authenticated
using (true);

create policy "events_coach_insert"
on public.events for insert
with check (public.is_team_coach(team_id) or public.is_admin());

create policy "events_coach_update_delete"
on public.events for update
using (public.is_team_coach(team_id) or public.is_admin())
with check (public.is_team_coach(team_id) or public.is_admin());

create policy "events_admin_delete"
on public.events for delete
using (public.is_team_coach(team_id) or public.is_admin());

-- -------------------------
-- players  (authenticated read; coaches of the team manage; admins all)
-- -------------------------
create policy "players_authenticated_select"
on public.players for select to authenticated
using (true);

create policy "players_coach_manage"
on public.players for all
using (public.is_team_coach(team_id) or public.is_admin())
with check (public.is_team_coach(team_id) or public.is_admin());

-- -------------------------
-- rsvps  (authenticated read; anyone authenticated can upsert;
--          coaches manage rows for their teams; admins all)
-- -------------------------
create policy "rsvps_authenticated_select"
on public.rsvps for select to authenticated
using (true);

create policy "rsvps_authenticated_insert"
on public.rsvps for insert to authenticated
with check (true);

create policy "rsvps_authenticated_update"
on public.rsvps for update to authenticated
using (true)
with check (true);

create policy "rsvps_coach_delete"
on public.rsvps for delete to authenticated
using (
  public.is_admin()
  or exists (
       select 1 from public.events e
       where e.id = rsvps.event_id
         and public.is_team_coach(e.team_id)
     )
);

-- -------------------------
-- registrations  (public signup form can insert; only staff read/update)
-- -------------------------
create policy "registrations_public_insert"
on public.registrations for insert to anon, authenticated
with check (true);

create policy "registrations_staff_select"
on public.registrations for select to authenticated
using (
  public.is_admin()
  or exists (
       select 1 from public.teams
       where teams.id = registrations.team_id
         and teams.coach_id = auth.uid()
     )
);

create policy "registrations_staff_update"
on public.registrations for update to authenticated
using (
  public.is_admin()
  or exists (
       select 1 from public.teams
       where teams.id = registrations.team_id
         and teams.coach_id = auth.uid()
     )
)
with check (
  public.is_admin()
  or exists (
       select 1 from public.teams
       where teams.id = registrations.team_id
         and teams.coach_id = auth.uid()
     )
);

-- -------------------------
-- payments  (no anon/authenticated insert — the Stripe webhook writes
--            with the service-role key, which bypasses RLS entirely)
-- -------------------------
create policy "payments_staff_select"
on public.payments for select to authenticated
using (
  public.is_admin()
  or exists (
       select 1 from public.registrations r
       join public.teams t on t.id = r.team_id
       where r.id = payments.registration_id
         and t.coach_id = auth.uid()
     )
);

-- INSERT/UPDATE/DELETE have no policies for anon/authenticated, so they
-- are blocked; the Stripe webhook writes payments using the service-role
-- key, which bypasses RLS entirely.

-- -------------------------
-- messages  (authenticated read; send with own sender_id; staff delete)
-- -------------------------
create policy "messages_authenticated_select"
on public.messages for select to authenticated
using (true);

create policy "messages_authenticated_insert"
on public.messages for insert to authenticated
with check (sender_id = auth.uid());

create policy "messages_staff_delete"
on public.messages for delete to authenticated
using (public.is_admin() or public.is_team_coach(team_id));

-- ============================================================
-- 4. REALTIME — team chat
-- ============================================================
-- Adds messages to the supabase_realtime publication so clients can
-- subscribe to new chat messages live.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end
$$;

-- ============================================================
-- 5. SEED DATA (DEMO ONLY — safe to delete later from Table Editor)
-- ============================================================
-- Three demo teams with two upcoming events each (dates are
-- relative to now() so they always look "upcoming").
-- No profiles/players are seeded because they depend on auth.users.

do $$
declare
  v_boys_u14  uuid := gen_random_uuid();
  v_girls_u12 uuid := gen_random_uuid();
  v_boys_u16  uuid := gen_random_uuid();
begin
  -- DEMO teams
  insert into public.teams (id, name, division, city) values
    (v_boys_u14,  'SSC Boys U14 – Salt Lake City', 'Boys U14',  'Salt Lake City'),
    (v_girls_u12, 'SSC Girls U12 – Herriman',      'Girls U12', 'Herriman'),
    (v_boys_u16,  'SSC Boys U16 – West Jordan',    'Boys U16',  'West Jordan')
  on conflict (id) do nothing;

  -- DEMO events (one practice + one game per team)
  insert into public.events (team_id, type, starts_at, ends_at, location, notes) values
    (v_boys_u14, 'practice', now() + interval '2 days',  now() + interval '2 days'  + interval '90 minutes',
     'Salt Lake City — Field A', 'DEMO: bring water, cones at 6pm'),
    (v_boys_u14, 'game',     now() + interval '5 days',  now() + interval '5 days'  + interval '2 hours',
     'Salt Lake City — Stadium Field', 'DEMO: home game vs Wasatch FC'),

    (v_girls_u12, 'practice', now() + interval '3 days', now() + interval '3 days' + interval '90 minutes',
     'Herriman — Community Park', 'DEMO: bring water, warm-ups at 5:30pm'),
    (v_girls_u12, 'game',     now() + interval '6 days', now() + interval '6 days' + interval '2 hours',
     'Herriman — Community Park', 'DEMO: away game vs Riverton United'),

    (v_boys_u16, 'practice', now() + interval '4 days',  now() + interval '4 days'  + interval '90 minutes',
     'West Jordan — High School Field', 'DEMO: strength session first 20 min'),
    (v_boys_u16, 'game',     now() + interval '7 days',  now() + interval '7 days'  + interval '2 hours',
     'West Jordan — High School Field', 'DEMO: home game vs Draper Dynamo');
end
$$;
