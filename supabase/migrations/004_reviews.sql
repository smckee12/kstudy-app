-- Feature 8: Study mode
-- Run this once in Supabase → SQL Editor, after 003_stars.sql.
--
-- reviews: one row each time I answer a card in study mode.
-- The dashboard, lesson mastery and streak (features 9–11) are all
-- calculated from this table, so nothing else needs to be stored.

create table public.reviews (
  id          bigint generated always as identity primary key,
  -- Deleting a card also deletes its review history.
  card_id     bigint not null references public.cards (id) on delete cascade,
  user_id     uuid not null default auth.uid() references public.users (id) on delete cascade,
  -- The date and time of the answer.
  reviewed_at timestamptz not null default now(),
  -- true = "Got it", false = "Missed it"
  correct     boolean not null
);

-- For "my reviews this week / per day" (dashboard, streak) and
-- "this card's latest answers" (lesson mastery).
create index reviews_user_id_reviewed_at_idx on public.reviews (user_id, reviewed_at);
create index reviews_card_id_reviewed_at_idx on public.reviews (card_id, reviewed_at);

-- Row-level security: each user can only see and add their own reviews.
-- There are no update or delete rules, so an answer can't be changed
-- after it's saved: the history stays honest.
alter table public.reviews enable row level security;

create policy "Users see their own reviews"
  on public.reviews for select
  using ((select auth.uid()) = user_id);

-- A user can only review a card that belongs to them.
create policy "Users review their own cards"
  on public.reviews for insert
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.cards
      where cards.id = card_id and cards.user_id = (select auth.uid())
    )
  );
