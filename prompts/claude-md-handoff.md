# Docs: CLAUDE.md hand-off — prompt log

Agent: Claude Code · Branch `docs/claude-md-handoff`

## Prompt 1

> Yes, I want to switch to a different chat to be efficient. Update the claude.md so I can pass all our information onto the next chat

## What the agent did

Updated `CLAUDE.md` so a new chat can pick up where this one stopped:

- **Where things stand:** features 1–6 are live, next is feature 7, and migrations 001–003 have been run. My 260 real words are in the live database, and local development uses the same database.
- **After merging:** how to wait for Vercel's check and when to ask me to try the live site.
- **How the code is organized:** which file holds the queries, rules, CSV reader, actions, pages and shared components.
- **Database:** the next migration is 004 (the `reviews` table for study mode), and a migration has to run before its PR is merged.
- **Testing in the browser:** use test words instead of my real words and clean up afterwards; how to test file uploads; what to do about the "only one dev server" problem from feature 3.
- **Rules:** my spreadsheet stays out of the repo.
