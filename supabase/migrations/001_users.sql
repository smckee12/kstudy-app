-- Feature 1: Sign up and log in
-- Run this once in Supabase → SQL Editor.
--
-- Supabase Auth stores the login itself (email + securely hashed password)
-- in its private auth.users table. This public users table is our own copy:
-- one row per account, which the rest of the app's tables link to.

create table public.users (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text not null unique,
  created_at timestamptz not null default now()
);

-- Row-level security: each user can only read their own row.
alter table public.users enable row level security;

create policy "Users can read their own row"
  on public.users for select
  using ((select auth.uid()) = id);

-- When someone signs up, automatically add their row to public.users.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.users (id, email) values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
