-- Migration: forks table + RLS policies
-- Run this in the Supabase SQL editor to apply the schema and policies.

create table if not exists public.forks (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  parent_post_id      uuid not null references public.posts(id) on delete cascade,
  fork_name           text not null,
  author_note         text not null,
  suggested_tags      jsonb not null default '[]'::jsonb,
  suggested_tech_stack jsonb not null default '[]'::jsonb,
  status              text not null default 'pending'
                        check (status in ('pending', 'approved', 'rejected'))
);

-- Enable Row Level Security
alter table public.forks enable row level security;

-- anon: INSERT allowed, but only with status = 'pending'
-- Prevents callers from bypassing the review queue by submitting approved/rejected status
create policy "anon_insert_forks"
  on public.forks
  for insert
  to anon
  with check (status = 'pending');

-- anon: SELECT all forks (pending shown in sidebar until moderated)
create policy "anon_select_forks"
  on public.forks
  for select
  to anon
  using (true);

-- authenticated (admin): full access
create policy "authenticated_all_forks"
  on public.forks
  for all
  to authenticated
  using (true)
  with check (true);
