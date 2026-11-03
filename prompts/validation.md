# Feature 4: Validation — prompt log

Agent: Claude Code · Issue #13 · Branch `feature/validation`

## Prompt 1

> Works, start feature 4

## What the agent did

- Replaced feature 3's single "Korean, English and Lesson are required." message with one friendly message per field, checked in the Server Actions (`app/actions/cards.ts`) before anything is saved:
  - No lesson chosen → "Please choose a lesson."
  - Blank Korean → "Please add the Korean word."
  - Blank English → "Please add the English meaning."
- A field that's only spaces counts as blank, because the form trims spaces first.
- Each message appears right under its field, and that field gets a red border (`app/cards/card-form.tsx`). Everything I typed stays in the form so I only fix what's missing.
- The same check runs on the add form and the edit form.
- Screen readers also read the message for each field (`aria-invalid` and `aria-describedby`).

## Why check on the server

The browser could skip a check that only runs in the page, so the real check happens in the Server Action. The database also refuses a blank Korean or English word (the `check` rules from feature 2), so there are three layers.

## How it was tested

Locally in the browser (`npm run dev`), logged in with my account:

- Saved a completely empty add form → all three messages, each under its field with a red border.
- Chose Lesson 2, typed 선생님, and typed only spaces for English → only "Please add the English meaning."; the lesson and Korean were kept.
- Typed "teacher" and saved → the word was saved and its page opened.
- On the edit form, cleared the Korean and saved → "Please add the Korean word."; the card was not changed.
- Deleted the test word afterwards. No server errors.

## Prompt 2

> Logged in, test it
