# K-Study — instructions for Claude Code

@AGENTS.md

A Korean vocab study app for my class assignment (UC Berkeley, solo app, due Wed Nov 4 2026). **PLAN.md is the source of truth**: the features in build order (section 2), the database design (section 3), the tests (section 4) and the design (section 6). Read it before starting a feature.

Live app: https://kstudy-cal-app.vercel.app · Repo: https://github.com/smckee12/kstudy-app

## Where things stand

Check, don't assume: `gh pr list --state all` shows which features are merged, and `gh issue list` shows open work. Build the next unmerged feature from PLAN.md section 2, in order.

Snapshot (Nov 3 2026): features 1–6 are merged and live (sign up/log in, data model, card CRUD, validation, CSV import, stars). **Next is feature 7: Find things** (search, filter by lesson or starred, sort). Migrations 001–003 have been run.

My real word bank is in the live database: 5 lessons and the 260 words I imported from my spreadsheet. Local `npm run dev` uses the **same** Supabase project as the live site.

## The feature loop (required for grading: never commit to main)

1. **Issue:** `gh issue create` titled "Feature N: <name>", body starting with the feature's user story from PLAN.md.
2. **Branch** from up-to-date `main`: `feature/<short-name>` (e.g. `feature/stars`). Docs-only changes use `docs/<name>`.
3. **Build** the feature. Save my prompts and what the agent did in `prompts/<short-name>.md` (same format as `prompts/auth.md`: my prompts quoted, what the agent did, any bug caught, differences from PLAN.md).
4. **Test** it locally in the browser (`npm run dev`, or the `kstudy-app` launch config) before opening the PR.
5. **PR** into `main`: what changed, differences from PLAN.md, a "Bug caught" section if there was one, how it was tested, and `closes #N`.
6. **Merge** only when I say so. Then pull `main` locally and confirm the Vercel check on the merge commit succeeded.

One feature per PR. Keep PRs small.

After merging: `gh pr merge N --merge`, `git switch main && git pull --ff-only`, then wait for Vercel with a background loop on `gh api repos/smckee12/kstudy-app/commits/<sha>/status --jq .state` until it's no longer `pending`. Then ask me to check the feature on the live site before starting the next one.

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind v4). This version is newer than your training data: read `node_modules/next/dist/docs/` before using an API you're not sure of. Middleware is called **proxy** (`proxy.ts`). Cache Components is turned **off** on purpose; pages render fresh per request.
- **Supabase** for the database and email + password login (`@supabase/ssr`). Server-side client and `getCurrentUser()` are in `lib/supabase/server.ts`. Data queries go in `lib/data.ts`, row types in `lib/types.ts`. Mutations are Server Actions with `useActionState` for friendly error messages (see `app/actions/auth.ts`).
- **Vercel** deploys `main` automatically. It is connected to `smckee12/kstudy-app`.
- Colors and font come from PLAN.md section 6 and are defined in `app/globals.css` (`navy`, `accent`, `success`, `surface`; Noto Sans KR).

## How the code is organized

- `lib/data.ts`: all reads. `getLessons()`, `getCards({ search, lessonId, starredOnly, sort })`, `getCard(id)`. The My words filters live in the URL and are parsed by `lib/card-filters.ts`. Cards come back as `CardWithLesson` (the card, its `lesson`, and `starred`). Add new filters/sorting here.
- `lib/card-rules.ts`: the card rules shared by the forms and the CSV import (`validateCard`, `toCardRow`, the friendly messages like "Please add the Korean word.").
- `lib/csv-import.ts`: reads a vocab CSV with Papa Parse. It runs in the browser for the preview and again in the Server Action before saving.
- `app/actions/`: Server Actions (`auth.ts`, `cards.ts`, `import.ts`, `stars.ts`, `reviews.ts`). They return `{ error }` or field errors instead of throwing.
- Pages: `/cards` (My words), `/cards/new`, `/cards/[id]`, `/cards/[id]/edit`, `/cards/import`, `/starred`, `/study` (pick a deck), `/study/[deck]` (a lesson id, `starred`, or `random?count=N` with 1–50 cards, checked in `lib/random-set.ts`; the flip-card session is `app/study/[deck]/study-session.tsx`). A missing or someone else's card shows "Card not found" (`app/cards/[id]/card-not-found.tsx`).
- Shared UI: `app/cards/card-list.tsx` (the word list used by My words and Starred), `app/cards/card-form.tsx` (add/edit form), `app/cards/star-button.tsx` (☆/★, optimistic).
- `samples/vocab-sample.csv`: a small test file for the importer.

## Database changes

- Every schema change is a new numbered file in `supabase/migrations/` (next one is after the highest existing number). Never edit a migration that has already been run.
- **I run the SQL myself** in Supabase → SQL Editor, as a new query. Give me the file and wait for me to confirm it ran **before** merging, or the live site breaks.
- Every table with user data has a `user_id uuid default auth.uid()` column and row-level security so users only see their own rows.
- Check whether a table exists with the publishable key from `.env.local`: `curl "$URL/rest/v1/<table>?select=id&limit=1" -H "apikey: $KEY"` (200 = exists, 404 = not yet). Next migration is `005_...`. `reviews` (004) exists: one row per study answer, insert-only. Features 9–11 calculate everything from it. Test reviews must use a test word (they can only be removed by deleting the card).
- A migration that the new code depends on must run **before** merging. Write it first and give it to me, then build while I run it.

## Testing in the browser

- The browser pane is usually already logged in to my account. If it shows the log-in page, ask me to log in; never type my password.
- **Never delete or change my real words.** To test edits or deletes, add a test word (e.g. 테스트 = "test word (delete me)"), use it, then delete it. Un-star anything you starred. Say what you cleaned up.
- File uploads: the pane can't use the file picker. Build a `File` in JavaScript, put it on the input with a `DataTransfer`, and fire a `change` event.
- Only one `next dev` can run in this folder. If another chat's server is running, use it at localhost:3000 or ask that chat to stop it; you can't kill another chat's process.
- If the dev server shows an old version of a file ("X is not a function" for code that exists), edit files with the Edit tool rather than `sed -i`, and restart the server if needed.

## Rules

- **No personal info in the repo** (it's public). Seed files use `you@example.com` as a placeholder. Never commit `.env.local`.
- Never commit Supabase's secret key (`sb_secret_...`) or put it in a `NEXT_PUBLIC_` variable.
- Don't create accounts or sign up on my behalf. I test sign-up and log-in with my own account.
- Explain things in plain language: I'm learning, and I have to explain how the app works at demo day and in my reflection.
- When a feature ships, update the "What it does" list in README.md.
- My vocab spreadsheet (`Korean_Vocab_Bank.xlsx`, Vocab Bank sheet) is on my computer, not in the repo. Never commit it or its contents. Its columns: Lesson, Topic, Korean, Pronunciation, Polite form, English meaning, Notes.
- At the end of each answer, say what's next in one line, and ask before merging.
