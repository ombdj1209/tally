-- Run after schema.sql. Atomic per-account quota; no service-role key required.
create table if not exists public.ai_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  requests integer not null default 0,
  primary key (user_id, day)
);
alter table public.ai_usage enable row level security;
-- Deliberately no direct client table policies: writes only through bounded RPC.
create or replace function public.consume_ai_request() returns boolean
language plpgsql security definer set search_path = '' as $$
declare n integer;
begin
  if auth.uid() is null then return false; end if;
  insert into public.ai_usage(user_id, day, requests)
  values (auth.uid(), (now() at time zone 'UTC')::date, 1)
  on conflict (user_id, day) do update set requests=public.ai_usage.requests+1
  where public.ai_usage.requests < 50
  returning requests into n;
  return n is not null;
end;
$$;
revoke all on function public.consume_ai_request() from public, anon;
grant execute on function public.consume_ai_request() to authenticated;
