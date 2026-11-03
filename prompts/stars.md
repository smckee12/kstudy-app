# Feature 6: Stars — prompt log

Agent: Claude Code · Issue #17 · Branch `feature/stars`

## Prompt 1

> Works, start feature 6

## What the agent did

- Wrote `supabase/migrations/003_stars.sql` (I ran it myself in Supabase → SQL Editor):
  - `stars` is a **junction table**: one row means "this user starred this card". This makes users and cards **many-to-many**, as in PLAN.md section 3.
  - The primary key is (user_id, card_id), so a card can only be starred once per user.
  - Deleting a card also deletes its star (`on delete cascade`).
  - Row-level security: I can only see, add and remove my own stars, and only on my own cards.
- A ☆ button next to every word in My words and on each word's page. Clicking it turns it into a red ★ (the accent color from PLAN.md section 6); clicking again removes the star.
  - The star changes the instant I click (React's `useOptimistic`), then saves in the background. If saving fails, it flips back and shows an error.
- New **Starred** page (`/starred`, linked in the header) with only my starred words.
- The card queries in `lib/data.ts` now say whether each card is starred. The Starred page uses `stars!inner`, which keeps only the cards that have a star.
- The word list moved into one shared component (`app/cards/card-list.tsx`) used by both My words and Starred.

## Prompt 2

> Done, it ran

(After I ran `003_stars.sql` in Supabase.)

## How it was tested

Locally in the browser, logged in, with my 260 imported words:

- Starred 1학년 and 과 in My words → both turned into a red ★ straight away, and were still starred after reloading.
- Starred page → "2 words to practice" with just those two.
- Un-starred 과 on the Starred page → it disappeared from the list.
- Un-starred 1학년 on its word page → Starred page empty again.
- Added a test word, starred it, then deleted it → its star was deleted too (Starred page empty), and My words was back to 260.
- No server errors.

## Differences from the plan

- None. The `stars` table matches PLAN.md section 3, except `user_id` is a `uuid` (same as the other tables).
