-- Migration 004 — per-user login tracking.
-- Three rows seeded for the founding team. last_seen ticked by /api/secure/heartbeat.

create table if not exists public.app_users (
  username      text primary key,
  display_name  text not null,
  color         text not null default '#E55A2B',
  last_seen     timestamptz,
  login_count   integer not null default 0,
  created_at    timestamptz not null default now()
);

insert into public.app_users (username, display_name, color) values
  ('anuj',    'Anuj',    '#E55A2B'),
  ('shreyas', 'Shreyas', '#5BA3E5'),
  ('niketan', 'Niketan', '#7BC97B')
on conflict (username) do nothing;

alter table public.app_users enable row level security;

drop policy if exists "app_users_r" on public.app_users;
create policy "app_users_r" on public.app_users for select using (true);

-- Writes are server-only (admin client bypasses RLS) — no client policy.

alter publication supabase_realtime add table public.app_users;
