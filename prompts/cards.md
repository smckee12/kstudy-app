# Feature 3: Create / read / update / delete — prompt log

Agent: Claude Code · Issue #11 · Branch `feature/cards`

## Prompt 1

> Build feature 3 (Create / read / update / delete for vocab cards) from `PLAN.md` section 2, following the feature loop in `CLAUDE.md`.

(Started from my main Claude Code session, which handed this feature to a new session.)

## What the agent did

- **Read:** added `getCards()` (all my words, newest first, with their lesson) and `getCard(id)` to `lib/data.ts`.
- **Create, update, delete:** wrote Server Actions in `app/actions/cards.ts`. They trim what I typed, store blank optional fields as empty, and send me to the word's page after saving.
- **Pages:**
  - `/cards`: list of my words (Korean, English, lesson), with "+ Add a word".
  - `/cards/new`: the add form. Lesson is a dropdown of my 5 lessons. Korean and English are required; pronunciation, polite form, example sentence and notes are optional.
  - `/cards/[id]`: one word's page, with Edit and Delete buttons.
  - `/cards/[id]/edit`: the same form, filled in with the word's current values.
- **Delete:** clicking Delete shows "Are you sure? This word will be deleted for good." with "Yes, delete" and "Cancel". Nothing is deleted until I click "Yes, delete".
- **Other people's cards:** row-level security (from feature 2) hides them, so opening someone else's card by its URL shows "Card not found" (PLAN.md test 1).
- Added a "My words" link in the header and a "See all my words" link on the home page.

## Differences from the plan

- Leaving Korean, English or Lesson blank shows one general message ("Korean, English and Lesson are required.") for now. Feature 4 replaces it with a friendly message for each field.
- The "Are you sure?" prompt appears on the page instead of as a browser pop-up, so it matches the app's look.

## How it was tested

Locally in the browser (`npm run dev`), logged in with my account:

- Saved with only Korean filled in: the form showed "Korean, English and Lesson are required." and kept the Korean I typed.
- Added 학생 = student in Lesson 1 with a pronunciation: it opened the word's page.
- Edited the pronunciation to [학쌩] and added a note: the page showed the changes.
- The list showed "1 word". `/cards/99999` and `/cards/abc/edit` showed "Card not found".
- Delete → Cancel kept the word. Delete → "Yes, delete" removed it and went back to an empty list.

## Prompt 2

> (From my main session) I stopped the old dev server on port 3000. Start your own and test.

The first dev server was started in another chat and kept running old code, so the new pages crashed until it was restarted. It wasn't a bug in the feature.
