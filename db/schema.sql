-- ─────────────────────────────────────────────────────────────────────
-- KVASI Capital Calendar · Postgres schema
-- Paste into Supabase SQL editor (one block).
-- ─────────────────────────────────────────────────────────────────────

create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ── enums ────────────────────────────────────────────────────────────
do $$ begin
  create type workspace_role as enum ('owner', 'editor', 'viewer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type program_status_enum as enum (
    'discovered','researching','preparing','applied',
    'interviewing','accepted','rejected','deferred','passed'
  );
exception when duplicate_object then null; end $$;

-- ── users (mirrors auth.users with role) ─────────────────────────────
create table if not exists public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text unique not null,
  name        text,
  avatar_url  text,
  color       text default '#e55a2b',
  role        workspace_role not null default 'viewer',
  created_at  timestamptz default now()
);

-- bootstrap trigger: any new auth.user with email in seed list gets owner role
create or replace function public.handle_new_user() returns trigger as $$
declare
  is_seed boolean;
begin
  -- Edit this list to add cofounder emails:
  is_seed := new.email in (
    'anuj@kvasi.ai',
    'zoreanuj@gmail.com',
    'niketan@kvasi.ai',
    'shreyas@kvasi.ai'
  );
  insert into public.users (id, email, name, avatar_url, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    new.raw_user_meta_data->>'avatar_url',
    case when is_seed then 'owner'::workspace_role else 'viewer'::workspace_role end
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── programs ─────────────────────────────────────────────────────────
create table if not exists public.programs (
  id           uuid primary key default uuid_generate_v4(),
  slug         text unique,
  name         text not null,
  org          text not null,
  tier         smallint not null check (tier between 1 and 3),
  kind         text not null,
  dilution     text not null,
  visa         text not null,
  loc          text not null,
  amount       text,
  terms        text,
  note         text,
  start_date   date,
  end_date     date,
  point_date   date,
  rolling      boolean not null default false,
  priority     boolean not null default false,
  custom_url   text,
  metadata     jsonb default '{}'::jsonb,
  search_tsv   tsvector generated always as (
    setweight(to_tsvector('english', coalesce(name,'')), 'A') ||
    setweight(to_tsvector('english', coalesce(org,'')), 'B')  ||
    setweight(to_tsvector('english', coalesce(note,'')), 'C') ||
    setweight(to_tsvector('english', coalesce(terms,'')), 'D')
  ) stored,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create index if not exists idx_programs_search on public.programs using gin(search_tsv);
create index if not exists idx_programs_name_trgm on public.programs using gin(name gin_trgm_ops);
create index if not exists idx_programs_kind on public.programs(kind);
create index if not exists idx_programs_tier on public.programs(tier);
create index if not exists idx_programs_point_date on public.programs(point_date);
create index if not exists idx_programs_priority on public.programs(priority) where priority = true;

-- ── status history ───────────────────────────────────────────────────
create table if not exists public.program_status (
  id          uuid primary key default uuid_generate_v4(),
  program_id  uuid not null references public.programs(id) on delete cascade,
  status      program_status_enum not null,
  changed_by  uuid references public.users(id),
  changed_at  timestamptz default now(),
  note        text
);
create index if not exists idx_program_status_program on public.program_status(program_id, changed_at desc);

create or replace view public.program_current_status as
  select distinct on (program_id) program_id, status, changed_by, changed_at
  from public.program_status
  order by program_id, changed_at desc;

-- ── assignees (who's responsible) ────────────────────────────────────
create table if not exists public.program_assignees (
  program_id uuid not null references public.programs(id) on delete cascade,
  user_id    uuid not null references public.users(id) on delete cascade,
  primary key (program_id, user_id)
);

-- ── todos ────────────────────────────────────────────────────────────
create table if not exists public.todos (
  id           uuid primary key default uuid_generate_v4(),
  program_id   uuid not null references public.programs(id) on delete cascade,
  title        text not null,
  done         boolean not null default false,
  due_date     date,
  assignee     uuid references public.users(id),
  position     numeric not null default 0,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);
create index if not exists idx_todos_program on public.todos(program_id, position);
create index if not exists idx_todos_assignee on public.todos(assignee, done);

-- ── comments (threaded) ──────────────────────────────────────────────
create table if not exists public.comments (
  id                uuid primary key default uuid_generate_v4(),
  program_id        uuid not null references public.programs(id) on delete cascade,
  author            uuid references public.users(id),
  body              text not null,
  parent_comment_id uuid references public.comments(id) on delete cascade,
  created_at        timestamptz default now()
);
create index if not exists idx_comments_program on public.comments(program_id, created_at);

-- ── tags ─────────────────────────────────────────────────────────────
create table if not exists public.tags (
  id    uuid primary key default uuid_generate_v4(),
  label text unique not null,
  color text default '#8b8478'
);
create table if not exists public.program_tags (
  program_id uuid not null references public.programs(id) on delete cascade,
  tag_id     uuid not null references public.tags(id) on delete cascade,
  primary key (program_id, tag_id)
);

-- ── attachments ──────────────────────────────────────────────────────
create table if not exists public.attachments (
  id         uuid primary key default uuid_generate_v4(),
  program_id uuid not null references public.programs(id) on delete cascade,
  url        text not null,
  label      text,
  uploaded_by uuid references public.users(id),
  created_at timestamptz default now()
);

-- ── activity feed (for realtime "X did Y") ───────────────────────────
create table if not exists public.activity_events (
  id         uuid primary key default uuid_generate_v4(),
  program_id uuid references public.programs(id) on delete cascade,
  actor      uuid references public.users(id),
  verb       text not null,
  payload    jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
create index if not exists idx_activity_recent on public.activity_events(created_at desc);

-- ── updated_at trigger ───────────────────────────────────────────────
create or replace function public.touch_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end; $$ language plpgsql;

drop trigger if exists trg_programs_touch on public.programs;
create trigger trg_programs_touch before update on public.programs
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_todos_touch on public.todos;
create trigger trg_todos_touch before update on public.todos
  for each row execute function public.touch_updated_at();

-- ── RLS helpers ──────────────────────────────────────────────────────
create or replace function public.current_role() returns workspace_role
  language sql stable security definer set search_path = public as $$
    select role from public.users where id = auth.uid();
  $$;

create or replace function public.is_member() returns boolean
  language sql stable security definer set search_path = public as $$
    select coalesce(public.current_role() in ('owner','editor','viewer'), false);
  $$;

create or replace function public.is_editor() returns boolean
  language sql stable security definer set search_path = public as $$
    select coalesce(public.current_role() in ('owner','editor'), false);
  $$;

-- ── enable RLS + policies ────────────────────────────────────────────
alter table public.users           enable row level security;
alter table public.programs        enable row level security;
alter table public.program_status  enable row level security;
alter table public.program_assignees enable row level security;
alter table public.todos           enable row level security;
alter table public.comments        enable row level security;
alter table public.tags            enable row level security;
alter table public.program_tags    enable row level security;
alter table public.attachments     enable row level security;
alter table public.activity_events enable row level security;

-- read for any member, write for editors/owners
do $$ declare t text; begin
  for t in
    select unnest(array[
      'programs','program_status','program_assignees','todos','comments',
      'tags','program_tags','attachments','activity_events','users'
    ])
  loop
    execute format('drop policy if exists "%I_r" on public.%I', t, t);
    execute format('drop policy if exists "%I_w" on public.%I', t, t);
    execute format('create policy "%I_r" on public.%I for select using (public.is_member())', t, t);
    execute format('create policy "%I_w" on public.%I for all using (public.is_editor()) with check (public.is_editor())', t, t);
  end loop;
end $$;

-- enable realtime broadcasting
alter publication supabase_realtime add table public.programs;
alter publication supabase_realtime add table public.program_status;
alter publication supabase_realtime add table public.todos;
alter publication supabase_realtime add table public.comments;
alter publication supabase_realtime add table public.activity_events;

-- ─────────────────────────────────────────────────────────────────────
-- ENTITIES (Obsidian-like CRM: investors / angels / companies / contacts)
-- One row per "note"; type + properties JSONB give it shape.
-- See db/migrations/003_entities.sql for the equivalent migration script.
-- ─────────────────────────────────────────────────────────────────────
do $$ begin
  create type entity_type as enum ('investor', 'angel', 'company', 'contact', 'program');
exception when duplicate_object then null; end $$;

create table if not exists public.entities (
  id          uuid primary key default uuid_generate_v4(),
  type        entity_type not null,
  slug        text unique not null,
  name        text not null,
  org         text,
  properties  jsonb not null default '{}'::jsonb,
  note        text,
  source      text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  search_tsv  tsvector generated always as (
    setweight(to_tsvector('english', coalesce(name,'')), 'A') ||
    setweight(to_tsvector('english', coalesce(org,'')), 'B')  ||
    setweight(to_tsvector('english', coalesce(note,'')), 'C') ||
    setweight(to_tsvector('english', coalesce(properties::text,'')), 'D')
  ) stored
);
create index if not exists idx_entities_type      on public.entities(type);
create index if not exists idx_entities_search    on public.entities using gin(search_tsv);
create index if not exists idx_entities_name_trgm on public.entities using gin(name gin_trgm_ops);
create index if not exists idx_entities_props_gin on public.entities using gin(properties jsonb_path_ops);

create table if not exists public.entity_links (
  id         uuid primary key default uuid_generate_v4(),
  from_id    uuid not null references public.entities(id) on delete cascade,
  to_id      uuid not null references public.entities(id) on delete cascade,
  context    text,
  created_at timestamptz not null default now(),
  unique (from_id, to_id, context)
);
create index if not exists idx_entity_links_from on public.entity_links(from_id);
create index if not exists idx_entity_links_to   on public.entity_links(to_id);

alter table public.entities      enable row level security;
alter table public.entity_links  enable row level security;

do $$ begin
  drop policy if exists "entities_r" on public.entities;
  drop policy if exists "entities_w" on public.entities;
  create policy "entities_r" on public.entities for select using (public.is_member());
  create policy "entities_w" on public.entities for all using (public.is_editor()) with check (public.is_editor());
  drop policy if exists "entity_links_r" on public.entity_links;
  drop policy if exists "entity_links_w" on public.entity_links;
  create policy "entity_links_r" on public.entity_links for select using (public.is_member());
  create policy "entity_links_w" on public.entity_links for all using (public.is_editor()) with check (public.is_editor());
end $$;

alter publication supabase_realtime add table public.entities;
alter publication supabase_realtime add table public.entity_links;

-- ─────────────────────────────────────────────────────────────────────
-- APP_USERS — per-user login tracking (separate from Supabase auth.users).
-- Three seeded rows for the founding team. last_seen ticked by heartbeat.
-- See db/migrations/004_app_users.sql for the equivalent migration.
-- ─────────────────────────────────────────────────────────────────────
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
do $$ begin
  drop policy if exists "app_users_r" on public.app_users;
  create policy "app_users_r" on public.app_users for select using (true);
end $$;
alter publication supabase_realtime add table public.app_users;
