# Feature 2: Data model — prompt log

Agent: Claude Code · Issue #7 · Branch `feature/data-model`

## Prompt 1

> Merge and then let's start feature 2

## What the agent did

- Wrote `supabase/migrations/002_lessons_and_cards.sql`, following PLAN.md section 3:
  - `lessons`: number, topic_korean, topic_english. A user can't have two lessons with the same number.
  - `cards`: korean, pronunciation, polite_form, english, example_sentence, notes. Each card belongs to one lesson (one-to-many).
  - Korean, English and topic_korean can't be blank, enforced by the database itself.
  - Row-level security so each user only sees and changes their own lessons and cards, and can only put a card in their own lesson.
- Wrote `supabase/seed/lessons.sql` to add my textbook's 5 lessons to my account.
- The home page now lists my lessons with how many words each has.

## Differences from the plan

- PLAN.md lists `user_id` as text. Supabase's account ids are UUIDs, so the column type is `uuid`.
- Deleting a lesson that still has cards is blocked, so a whole lesson of words can't be deleted by accident.
