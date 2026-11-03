# Feature 1: Sign up and log in — prompt log

Agent: Claude Code · Issue #3 · Branch `feature/auth`

## Prompt 1

> Start feature #1

## What the agent did

- Installed Node.js (it wasn't on my Mac) and scaffolded a Next.js app.
- Turned off Next.js's experimental "Cache Components" setting to keep pages simple: every page loads fresh for the logged-in user.
- Connected Supabase Auth for email + password sign-up, log-in and log-out (`app/actions/auth.ts`).
- Added `proxy.ts`, which runs before every page: logged-out visitors are sent to `/login`, and logged-in users skip the log-in and sign-up pages.
- Wrote `supabase/migrations/001_users.sql`: the `users` table, a row-level security rule so each user can only read their own row, and a trigger that adds a `users` row whenever someone signs up.
- Friendly messages for blank fields, short passwords, wrong passwords and an email that's already registered.

## Bug I caught

- I signed up, confirmed my email, and then couldn't log in ("That email and password don't match"). Signing up again with the same email said "Check your email" instead of telling me the account already existed. Supabase hides existing accounts on sign-up when "Confirm email" is on, so the agent added a check for that case. Most likely I mistyped my password at sign-up, so I deleted the account in Supabase and signed up again, and log-in worked.

## Prompt 2

> I confirmed my email but it's not letting me log in

## Decisions I made

- Email + password (at least 6 characters) instead of a 4-digit PIN. Supabase requires 6+ characters, and a PIN is too easy to guess. See PLAN.md feature 1.
