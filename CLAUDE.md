# K-Study — instructions for Claude Code

@AGENTS.md

A Korean vocab study app for my class assignment (UC Berkeley, solo app, due Wed Nov 4 2026). **PLAN.md is the source of truth**: the features in build order (section 2), the database design (section 3), the tests (section 4) and the design (section 6). Read it before starting a feature.

Live app: https://kstudy-cal-app.vercel.app · Repo: https://github.com/smckee12/kstudy-app

## Where things stand

Check, don't assume: `gh pr list --state all` shows which features are merged, and `gh issue list` shows open work. Build the next unmerged feature from PLAN.md section 2, in order.

## The feature loop (required for grading: never commit to main)

1. **Issue:** `gh issue create` titled "Feature N: <name>", body starting with the feature's user story from PLAN.md.
2. **Branch** from up-to-date `main`: `feature/<short-name>` (e.g. `feature/stars`). Docs-only changes use `docs/<name>`.
3. **Build** the feature. Save my prompts and what the agent did in `prompts/<short-name>.md` (same format as `prompts/auth.md`: my prompts quoted, what the agent did, any bug caught, differences from PLAN.md).
4. **Test** it locally in the browser (`npm run dev`, or the `kstudy-app` launch config) before opening the PR.
5. **PR** into `main`: what changed, differences from PLAN.md, a "Bug caught" section if there was one, how it was tested, and `closes #N`.
6. **Merge** only when I say so. Then pull `main` locally and confirm the Vercel check on the merge commit succeeded.

One feature per PR. Keep PRs small.

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind v4). This version is newer than your training data: read `node_modules/next/dist/docs/` before using an API you're not sure of. Middleware is called **proxy** (`proxy.ts`). Cache Components is turned **off** on purpose; pages render fresh per request.
- **Supabase** for the database and email + password login (`@supabase/ssr`). Server-side client and `getCurrentUser()` are in `lib/supabase/server.ts`. Data queries go in `lib/data.ts`, row types in `lib/types.ts`. Mutations are Server Actions with `useActionState` for friendly error messages (see `app/actions/auth.ts`).
- **Vercel** deploys `main` automatically. It is connected to `smckee12/kstudy-app`.
- Colors and font come from PLAN.md section 6 and are defined in `app/globals.css` (`navy`, `accent`, `success`, `surface`; Noto Sans KR).

## Database changes

- Every schema change is a new numbered file in `supabase/migrations/` (next one is after the highest existing number). Never edit a migration that has already been run.
- **I run the SQL myself** in Supabase → SQL Editor, as a new query. Give me the file and wait for me to confirm it ran **before** merging, or the live site breaks.
- Every table with user data has a `user_id uuid default auth.uid()` column and row-level security so users only see their own rows.
- Check whether a table exists with the publishable key from `.env.local`: `curl "$URL/rest/v1/<table>?select=id&limit=1" -H "apikey: $KEY"` (200 = exists, 404 = not yet).

## Rules

- **No personal info in the repo** (it's public). Seed files use `you@example.com` as a placeholder. Never commit `.env.local`.
- Never commit Supabase's secret key (`sb_secret_...`) or put it in a `NEXT_PUBLIC_` variable.
- Don't create accounts or sign up on my behalf. I test sign-up and log-in with my own account.
- Explain things in plain language: I'm learning, and I have to explain how the app works at demo day and in my reflection.
- When a feature ships, update the "What it does" list in README.md.
