-- Feature 6: Stars
-- Run this once in Supabase → SQL Editor, after 002_lessons_and_cards.sql.
--
-- stars: a junction table meaning "this user starred this card".
-- Users and cards are many-to-many through it.

create table public.stars (
  user_id    uuid not null default auth.uid() references public.users (id) on delete cascade,
  -- Deleting a card also deletes its star.
  card_id    bigint not null references public.cards (id) on delete cascade,
  created_at timestamptz not null default now(),
  -- A card can only be starred once per user.
  primary key (user_id, card_id)
);

create index stars_card_id_idx on public.stars (card_id);

-- Row-level security: each user can only see, add and remove their own stars.
alter table public.stars enable row level security;

create policy "Users see their own stars"
  on public.stars for select
  using ((select auth.uid()) = user_id);

-- A user can only star a card that belongs to them.
create policy "Users star their own cards"
  on public.stars for insert
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.cards
      where cards.id = card_id and cards.user_id = (select auth.uid())
    )
  );

create policy "Users remove their own stars"
  on public.stars for delete
  using ((select auth.uid()) = user_id);
