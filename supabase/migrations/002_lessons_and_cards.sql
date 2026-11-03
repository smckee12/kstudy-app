-- Feature 2: Data model (lessons and cards)
-- Run this once in Supabase → SQL Editor, after 001_users.sql.
--
-- lessons: one row per textbook lesson, e.g. 2 · 학교생활 (School life)
-- cards:   one row per vocab word. Columns mirror the "Vocab Bank" sheet.
-- One lesson has many cards (one-to-many).

create table public.lessons (
  id            bigint generated always as identity primary key,
  user_id       uuid not null default auth.uid() references public.users (id) on delete cascade,
  number        integer not null,
  topic_korean  text not null check (btrim(topic_korean) <> ''),
  topic_english text,
  created_at    timestamptz not null default now(),
  -- A user can't have two "Lesson 2"s.
  unique (user_id, number)
);

create table public.cards (
  id               bigint generated always as identity primary key,
  -- Deleting a lesson that still has cards is blocked, so cards are never lost by accident.
  lesson_id        bigint not null references public.lessons (id) on delete restrict,
  user_id          uuid not null default auth.uid() references public.users (id) on delete cascade,
  korean           text not null check (btrim(korean) <> ''),
  pronunciation    text,
  polite_form      text,
  english          text not null check (btrim(english) <> ''),
  example_sentence text,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index cards_lesson_id_idx on public.cards (lesson_id);
create index cards_user_id_idx on public.cards (user_id);

-- Keep cards.updated_at current whenever a card is edited.
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger cards_set_updated_at
  before update on public.cards
  for each row execute function public.set_updated_at();

-- Row-level security: each user can only see and change their own rows.
alter table public.lessons enable row level security;
alter table public.cards enable row level security;

create policy "Users manage their own lessons"
  on public.lessons for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- A card can only be put in a lesson that belongs to the same user.
create policy "Users manage their own cards"
  on public.cards for all
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.lessons
      where lessons.id = lesson_id and lessons.user_id = (select auth.uid())
    )
  );
