-- Migration 003 — polymorphic entities + bidirectional links.
-- Obsidian-style: one row per "note" regardless of whether it's an investor,
-- angel, company, contact, or program. The `type` column + `properties` JSONB
-- give each row its shape. `entity_links` records bidirectional references.
--
-- Run once against existing Supabase Postgres.

create extension if not exists "pg_trgm";
create extension if not exists "uuid-ossp";

-- ── enum ─────────────────────────────────────────────────────────────
do $$ begin
  create type entity_type as enum ('investor', 'angel', 'company', 'contact', 'program');
exception when duplicate_object then null; end $$;

-- ── entities ─────────────────────────────────────────────────────────
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

-- ── entity_links (bidirectional refs) ────────────────────────────────
-- A link from A → B means "A's note references B". The Backlinks panel
-- on B's page is just `select from where to_id = B`.
create table if not exists public.entity_links (
  id         uuid primary key default uuid_generate_v4(),
  from_id    uuid not null references public.entities(id) on delete cascade,
  to_id      uuid not null references public.entities(id) on delete cascade,
  context    text,    -- e.g. "led seed round", "intro'd by", or null
  created_at timestamptz not null default now(),
  unique (from_id, to_id, context)
);
create index if not exists idx_entity_links_from on public.entity_links(from_id);
create index if not exists idx_entity_links_to   on public.entity_links(to_id);

-- ── touch updated_at trigger ─────────────────────────────────────────
create or replace function public.entities_touch() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_entities_touch on public.entities;
create trigger trg_entities_touch before update on public.entities
  for each row execute function public.entities_touch();

-- ── RLS — same pattern as programs (read: members, write: editors) ───
alter table public.entities      enable row level security;
alter table public.entity_links  enable row level security;

drop policy if exists "entities_r" on public.entities;
drop policy if exists "entities_w" on public.entities;
create policy "entities_r" on public.entities for select using (public.is_member());
create policy "entities_w" on public.entities for all
  using (public.is_editor()) with check (public.is_editor());

drop policy if exists "entity_links_r" on public.entity_links;
drop policy if exists "entity_links_w" on public.entity_links;
create policy "entity_links_r" on public.entity_links for select using (public.is_member());
create policy "entity_links_w" on public.entity_links for all
  using (public.is_editor()) with check (public.is_editor());

-- ── realtime ─────────────────────────────────────────────────────────
do $$ begin
  alter publication supabase_realtime add table public.entities;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.entity_links;
exception when duplicate_object then null; end $$;
