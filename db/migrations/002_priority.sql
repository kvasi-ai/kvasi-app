-- Migration 002 — add priority flag for ≥$500K guaranteed-funding incubators.
-- Run once against existing Supabase Postgres.

alter table public.programs
  add column if not exists priority boolean not null default false;

create index if not exists idx_programs_priority
  on public.programs(priority) where priority = true;
