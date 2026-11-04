# Feature 8: Study mode — prompt log

Agent: Claude Code · Issue #24 · Branch `feature/study`

## Prompt 1

> Works, start feature 8

## What the agent did

- Wrote `supabase/migrations/004_reviews.sql` first (I ran it myself in Supabase → SQL Editor while the agent built the pages):
  - `reviews` has one row per answer: which card, whose, when (`reviewed_at`), and `correct` (true = "Got it", false = "Missed it"), as in PLAN.md section 3.
  - Deleting a card also deletes its reviews (`on delete cascade`).
  - Row-level security: I can only see and add my own reviews, and only for my own cards. There are **no update or delete rules**, so a saved answer can't be changed later and the history stays honest.
  - Two indexes (lookup shortcuts) for the next features: reviews by date (dashboard, streak) and by card (lesson mastery).
- New **Study** page (`/study`, linked in the header and from each lesson on the home page): pick a lesson, or my starred words.
- A study session (`/study/3`, or `/study/starred`), in `app/study/[deck]/study-session.tsx`:
  - The cards are **shuffled** (`lib/shuffle.ts`) so I can't just memorize the order.
  - The **Korean** is on the front. Tapping the card (or Flip, or Space) shows the **English**, plus the pronunciation, polite form and example sentence if the word has them.
  - **✗ Missed it** / **✓ Got it** (or the ← / → keys). Each answer is saved straight away by a Server Action (`app/actions/reviews.ts`), so if I leave halfway, the answers so far are kept.
  - The next card appears immediately while the answer saves in the background. If a save fails, a red message offers "Try saving again".
  - A progress bar and ✓/✗ counts while studying. At the end: my score and % correct, the words I missed, and buttons to **study just the missed words**, study them all again, or pick another lesson.
- Header: added "Study". On phones the "한국어" next to the logo is hidden so the four links fit on one line.

## How it was tested

Locally in the browser, logged in:

- Before the migration ran: the Study page listed my 5 lessons with their word counts. Lesson 1 opened shuffled (구 first). Space flipped it (구 = nine), → answered Got it, and the progress bar moved on. Saving failed because the table didn't exist yet, and the red "Try saving again" message appeared, which tested the error path. That answer was never saved.
- After the migration ran: to keep test answers out of my real history, the agent added a test word (테스트 = "test word (delete me)"), starred it, and studied only the Starred deck:
  - Missed it → "0 / 1, 0% correct, All answers saved" and the test word under "Missed".
  - "Study the 1 missed word" → Space, → → "1 / 1, 100% correct". The server log shows both answers saved for the test card only.
- `/study/abc` and `/study/99999` → "Lesson not found". The Starred deck with no stars → "There are no words to study here yet".
- Checked on a phone-sized screen. No server errors.
- Cleanup: deleted the test word, which also deleted its star and its 2 reviews. Lesson 1 is back to 45 words. None of my real words were answered, changed or starred.

## Bug caught

- The first error message showed Supabase's technical text ("Could not find the table 'public.reviews' in the schema cache"). Changed it to a plain "Couldn't save your answer." The details go to the server log instead.

## Differences from the plan

- Added a **Starred** deck next to the lessons, to drill my problem words (the point of feature 6).
- Added "study just the missed words" at the end of a session.
- Keyboard shortcuts (Space, ←, →) for studying on a laptop.

## Prompt 2

> I want to add an option to study a randomly selected group of cards from all lessons. I want the user to be able to type in a number of cards they want to study in a numerical field (max 50 cards), then the site should randomly select cards from all lessons, shuffle them, and present them for study

## What the agent did

- Added a **Random mix from all lessons** box at the top of the Study page: a number field (default 20, 1 to 50) and a Start button.
  - It's a Next.js `<Form>`. Submitting goes to `/study/random?count=20` without reloading the whole page.
  - The number field's `min`, `max` and `required` make the browser stop anything outside 1–50 before sending it. If I have fewer than 50 words, the maximum is how many words I have.
- `/study/random?count=N` (in `app/study/[deck]/page.tsx`): the server shuffles **all** my cards and keeps the first N. That one shuffle both picks the cards at random and puts them in a random order. The same study session is used, so answers are saved the same way.
- The number in the URL is checked again on the server (`lib/random-set.ts`), because anyone can type a URL by hand. Anything that isn't a whole number from 1 to 50 shows "Please choose a number of cards from 1 to 50."
- At the end of a random mix there's a **New random set** button that loads a fresh set of the same size.

## How it was tested

- Typed 7 and pressed Start → "Random mix · 7 cards", shuffled. Only looked at the cards, didn't answer them, so nothing was added to my real history.
- Loaded a 50-card set three times: each time it had 50 different cards (no repeats), from all 5 lessons, in a different order.
- Typing 51 in the box → the browser blocked it ("Value must be less than or equal to 50").
- Typing the URL by hand with 0, 51, -3, 2.5, abc or nothing → "Please choose a number of cards from 1 to 50."
- No server errors.
- **Not tested in the browser:** the "New random set" button at the end, because reaching the end means answering real words. It's a plain link back to the same URL, which picks a fresh set each time (tested above).

## Differences from the plan

- The random mix isn't in PLAN.md. It's an addition I asked for during feature 8.
