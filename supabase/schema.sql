-- Run once in the Supabase SQL editor. Each authenticated account owns a private ledger.
create table public.ledgers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  revision bigint not null default 1,
  updated_at timestamptz not null default now()
);
alter table public.ledgers enable row level security;
create policy "Read own ledger" on public.ledgers for select to authenticated using ((select auth.uid()) = user_id);
create policy "Create own ledger" on public.ledgers for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own ledger" on public.ledgers for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
grant select, insert, update on public.ledgers to authenticated;
