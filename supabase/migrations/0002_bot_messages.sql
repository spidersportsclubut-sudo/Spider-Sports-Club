-- ============================================================
-- Spider Sports Club — Migration 0002: Spider PR bot messages
-- ============================================================
-- DRAFT — DO NOT APPLY TO LIVE SUPABASE WITHOUT APPROVAL.
-- This file is only a ready-to-run SQL file for the club team.
-- It creates the table the Spider PR widget writes captured visitor
-- messages into (name, contact, question, created_at).
--
-- Design notes:
-- - Row Level Security is ON. Anonymous visitors may INSERT only, so
--   the public widget can capture messages without reading anyone
--   else's. Staff read access is intentionally left to a later
--   migration once staff roles are wired up; until then the club
--   team reads rows from the Supabase dashboard.
-- - No destructive statements: CREATE IF NOT EXISTS only.
-- ============================================================

create table if not exists public.bot_messages (
  id         bigint generated always as identity primary key,
  name       text not null,
  contact    text not null,
  question   text not null,
  created_at timestamptz not null default now()
);

alter table public.bot_messages enable row level security;

drop policy if exists "bot_messages_anon_insert" on public.bot_messages;
create policy "bot_messages_anon_insert"
  on public.bot_messages
  for insert
  to anon
  with check (true);
