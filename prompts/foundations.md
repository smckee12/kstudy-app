# Docs: Foundations (plan, setup and features 1–6) — prompt log

Agent: Claude Code · Issues #1, #3, #5, #7, #9, #11, #13, #15, #17 · Branches `1-plan`, `feature/auth`, `docs/readme`, `feature/data-model`, `docs/claude-md`, `feature/cards`, `feature/validation`, `feature/csv-import`, `feature/stars`, `docs/claude-md-handoff`

This log covers two connected chats: my main chat (the plan, features 1 and 2, the README, CLAUDE.md, and the Vercel setup) and the chat it started (features 3–6 and a CLAUDE.md update). Features 7 and later were built in other chats and have their own logs.

I left out short replies like "Merge it", and questions where the agent only explained something and nothing changed (for example, how pushing to GitHub works, and how Vercel, Supabase, GitHub and Claude Code fit together).

# Main chat

## Prompt 1

> Can you connect to this repo https://github.com/smckee12/kstudy-app

## What the agent did

- Cloned the repo to my Documents folder and moved the session there.

## Prompt 2

> There should be another branch

## What the agent did

- Fetched from GitHub, found `1-plan`, switched to it and read `PLAN.md`. It also pointed out that the GitHub description still said fantasy football.

## Bug caught

- The agent told me the repo had one branch, because it had only looked at the default branch. I noticed. The agent corrected itself.

## Prompt 3

> I'm trying to figure out how I want my database to be set up. Use the 1-plan branch and look at that markdown file

## What the agent did

- Suggested five tables (`users`, `decks`, `cards`, `reviews`, `stars`) with a diagram, in chat only.

## Design choices

- A `reviews` table with one row per answer, because it's what makes "how well I know it" and the dashboard possible.
- Decks instead of tags, and right/wrong instead of a 1–4 rating, because they're simpler to build. Those were the agent's suggestions.

## Prompt 4

> @"…/Korean/Korean_Vocab_Bank.xlsx"
> I already have a bunch of Korean vocab straight from my textbook. Make the card database mirror this

(I shortened the file path to keep my computer's folder names out of this public repo.)

## What the agent did

- Read the spreadsheet's sheets and columns. The "Vocab Bank" sheet had 257 rows of words at that point, across Lessons 1–5.
- Replaced decks with `lessons` (number, Korean topic, English topic), and gave `cards` the same columns as my sheet. It wrote this into the Database section of `PLAN.md`, with a table showing which column goes where.

## Design choices

- `cards.korean` isn't unique, because 8 words in my sheet appear twice with different meanings.
- Only Korean, English and the lesson are required, because most rows have no pronunciation or polite form.

## Prompt 5

> Keep example-sentence. I can add those. If I wanted to have lessons with numbers, could that numbers sheet be a separate database?

## What the agent did

- Added `example_sentence` back to `cards` as an optional field.
- Explained that the Numbers sheet could be two more tables in the same database (`numbers` and `counters`), not a separate database. I didn't ask for them, so they were never added.

## Prompt 6

> Okay, I'm doing this a little out of order (sorry). This is the assignment as written:

(I'm quoting only my own sentence. The rest of the message was the assignment text, pasted in.)

## What the agent did

- Compared the assignment to `PLAN.md` and listed the gaps: user stories, my own features, tests, technologies, design, and risks.
- Suggested three features of my own: CSV import, study mode and a streak counter. It also drafted the two tests.

## Prompt 7

> Your three features sound good but I want to add another one. With the reviews table, I also want to track how well a user knows a specific subject/topic

## What the agent did

- Explained this needs no new tables, because a review points to a card and a card points to a lesson.
- Offered two definitions of "knowing" a topic: overall accuracy, or the most recent answer on each word. It recommended the most recent answer.

## Prompt 8

> Yes, and draft out the rest of the plan. Show it to me when you're done and I will review. I think I want to change how we track progress but I'll wait to review it in the draft

## What the agent did

- Rewrote `PLAN.md` with all 7 sections and an empty Plan vs. Reality table: 11 features as user stories, the tests, the technologies, the design, and the risks and cuts.

## Design choices

- These were the agent's first draft for me to review: Next.js, Supabase, Vercel, Recharts and Papa Parse, the colors and font, and cutting the streak first and then lesson mastery.
- With Supabase handling log-in, `users.password_hash` came out of the plan.

## Bug caught

- While writing this log, the agent noticed that `PLAN.md` line 12 says "Features 1–7 are the required spine; features 8–11 are my own." That's wrong: CSV import (#5) is mine and the dashboard (#9) is required. The agent wrote that line in this draft and neither of us caught it. It hasn't been changed.

## Prompt 9

> Is there a way to be able to track how recently a word was looked at and lower the mastery if it's been a while?
>
>
> Okay

(This was a reply to the agent's line about a word counting as known when my most recent answer was "Got it".)

## What the agent did

- Offered two options using the `reviews.reviewed_at` date, with no database change: A, a word expires after a fixed 7 days; B, a word stays known for longer the more times in a row I get it right.

## Prompt 10

> Let's do Option B

## What the agent did

- Updated feature 10 in `PLAN.md` with four statuses (New, Known, Fading, Missed) and the time limits (1 → 2 days, 2 → 4, 3 → 7, 4 or more → 14).
- Noticed I had edited feature 1 by hand to use a four-digit PIN. It told me Supabase wants at least 6 characters and a PIN is easy to guess, and asked what I wanted.

## Prompt 11

> Use a password

## What the agent did

- Changed feature 1 back to an email and a password of at least 6 characters. I then told it to commit, push, open PR #2 and merge it.

## Prompt 12

> Start feature #1

## What the agent did

- Opened Issue #3, and installed Node.js with Homebrew after I approved it.
- Built the app, sign-up, log-in, log-out and the `users` table. See `prompts/auth.md`.

## Design choices

- Turned off Next.js's "Cache Components" setting to keep the code simple.

## How it was tested

After I set up Supabase and told the agent "Supabase is ready":

- The agent checked that `.env.local` was filled in and Supabase answered (200). The `users` table returned no rows to someone not logged in.
- Logged out, `/` redirected to `/login`.
- A blank log-in showed "Please enter your email and password." A 3-character sign-up password showed "Your password needs at least 6 characters." The server logged no errors.
- The agent didn't create a real account, because that sends an email and password to Supabase. I signed up, logged out and logged back in myself.

## Prompt 13

> I confirmed my email but it's not letting me log in

## Bug caught

- I found this one. The server log showed Supabase rejecting the password, not the confirmation. The most likely cause was a typo at sign-up, but we can't prove that. I deleted the account in Supabase, signed up again and told the agent "It works now".
- The log also showed a real bug: signing up again with the same email said "Check your email" instead of saying the account existed. Supabase hides existing accounts while "Confirm email" is on. The agent added a check in `app/actions/auth.ts`.

## How it was tested

- **Not tested in the browser:** the existing-email fix. It only passed the type check and lint, because trying it meant submitting a real sign-up.

## Prompt 14

> Where am I supposed to add the environment variables in Vercel? I've already deployed this, but I didn't see anywhere to put in my variables

## What the agent did

- Walked me through Settings → Environment Variables and redeploying.

## Prompt 15

> It's telling me to remove the public framework prefix

## What the agent did

- Told me to ignore the warning and keep the names. The code looks for the `NEXT_PUBLIC_` names, and the publishable key is meant to be public. The secret key should never go there.

## How it was tested

- After I sent the live URL, the agent checked it: `/` redirected to `/login` (307), and `/login` and `/signup` loaded (200).

## Prompt 16

> Can you put the URL into the README?

## What the agent did

- The repo had no README, so it wrote one with the live URL, tools and setup steps. Issue #5, PR #6.

## Prompt 17

> Merge and then let's start feature 2

## What the agent did

- Merged PR #6, then wrote the `lessons` and `cards` tables and the home page lesson list. See `prompts/data-model.md`.
- I ran both SQL files in Supabase myself.

## Design choices

- Deleting a lesson that still has words is blocked, so a lesson's words can't be lost by accident. That was the agent's choice.

## Bug caught

- I had put my real email in my copy of the seed file to run it. The agent caught that before committing and put the placeholder back, because the repo is public.

## How it was tested

- `lessons` and `cards` returned no rows to someone not logged in.
- Logged in locally, the home page showed all 5 lessons, each with 0 words.

## Differences from the plan

- `user_id` is a `uuid` instead of text, because that's the type of Supabase's account ids.

## Prompt 18

> A couple of questions.
>
> 1. Remind me again how VErcel, supabase, and github, and claude code all work together.
> 2. My professor mentioned starting new chats is often more efficient token-wise, what's your recommendation for when I should start a new chat?
> 3. My cards and decks aren't showing up, nothing in Vercel looks out of the ordinary but idk what I'm looking at

## What the agent did

- Answered 1 and 2 with explanations, and recommended a new chat after each merged feature, with a CLAUDE.md to carry the rules forward.
- For 3, it asked me what the deployment and home page showed. It also said I had no cards yet, since adding words was feature 3.

## Prompt 19

> This is waht I see on the live site

(With a screenshot of the old feature 1 home page.)

## What the agent did

- Recognized the old home page, so the live site was running old code. It checked GitHub, found no Vercel status on any merge, and told me Vercel wasn't connected to my repo.

## Prompt 20

> This looks like it's connected already

(With a screenshot of Vercel's Git settings.)

## Bug caught

- I noticed my lessons were missing from the live site. The agent's first diagnosis (not connected) was only partly right, and my screenshot showed Vercel was connected. The agent then saw the repo name: `kstudy-cal-app`, not `kstudy-app`.
- `kstudy-cal-app` was a separate private repo with one commit, created that day. Vercel had been watching that copy, so my merges never reached the live site. Before this, the agent had seen no deploy status and wrongly assumed my Vercel setup just didn't report one, when it should have looked into it.
- I disconnected it and connected `smckee12/kstudy-app`.

## Prompt 21

> Can you check now? I Want to delete the other repo but double check I'm connected to the right repo

## How it was tested

- GitHub showed a Vercel **success** status on the merge commit for PR #8 (`f645be4`), from my `kstudy-cal-app` Vercel project.
- **Not checked by the agent:** my lessons on the live home page, because it wasn't logged in there. It asked me to check before deleting the other repo.

## Prompt 22

> Did you add the instructions to the claude readme? I want to start a new chat

## What the agent did

- It hadn't yet. It wrote `CLAUDE.md` with the feature loop, stack notes, database steps and rules. Issue #9, PR #10.
- It then offered a card to start feature 3 in a new chat.

# Connected chat

## Prompt 23

I clicked the New task card, so I didn't type anything here. The main chat's agent wrote the brief: build feature 3 following CLAUDE.md, with the fields and "Are you sure?" delete from PLAN.md, and no new migration. (`prompts/cards.md` shows a shortened version of that brief as a quote, but those weren't my words.)

## What the agent did

- Opened Issue #11 and built `/cards`, `/cards/new`, `/cards/[id]` and `/cards/[id]/edit`, with queries in `lib/data.ts` and actions in `app/actions/cards.ts`.

## Bug caught

- The agent found this one. `/cards` crashed with "getCards is not a function" even though the code was fine and a production build passed. The main chat's dev server on port 3000 was still running old code, and the new chat wasn't allowed to stop it. The main chat stopped its own server, and a fresh one worked.
- The agent guessed the server missed the change because of how it edited the file (`sed -i`). It said it hadn't confirmed that.

## How it was tested

I was already logged in in the browser pane.

- With only Korean filled in, the form showed "Korean, English and Lesson are required." and kept my typing.
- Added a test word in Lesson 1, and the word's page opened. Edited its pronunciation and added a note, and both changes showed.
- `/cards/99999` and `/cards/abc/edit` showed "Card not found".
- Delete → Cancel kept the word. Delete → "Yes, delete" removed it.
- Type check, lint and production build passed. The server logged no errors.
- **Not tested:** opening another user's card, because this chat had only my account. The "Card not found" checks used ids that don't exist.
- **Cleanup:** the test word was deleted.

## Differences from the plan

- The "Are you sure?" prompt appears on the page instead of as a browser pop-up.

## Prompt 24

> I'm confused about what the blocking issue was.

I also ran `npm run dev` myself, and it complained that another dev server was already running.

## What the agent did

- Explained the dev server problem, and that Next.js allows only one dev server per folder. Nothing changed in the code.

## Prompt 25

> and that's a local folder, right?

## What the agent did

- Explained that `localhost` runs from my folder, but my local copy uses the same Supabase database as the live site. So test data lands in my real database, and it has to be cleaned up.

## Prompt 26

> Works, start feature 4

## What the agent did

- Opened Issue #13. Replaced the general message with one per field: "Please choose a lesson.", "Please add the Korean word." and "Please add the English meaning." Each shows under its field with a red border, and a field with only spaces counts as blank.

## Design choices

- The real check runs in the Server Action, because a check in the page can be skipped. The database also refuses a blank Korean or English word.

## Prompt 27

> Logged in, test it

## How it was tested

- An empty add form showed all three messages.
- With Lesson 2 and Korean filled in and only spaces for English, only the English message showed, and the rest was kept.
- With English filled in, the word saved and its page opened.
- On the edit form with Korean cleared, the Korean message showed and the card didn't change.
- No server errors.
- **Cleanup:** the test word was deleted, back to 0 words.

## Differences from the plan

- None.

## Prompt 28

> Works, start feature 5

## What the agent did

- Opened Issue #15 and installed Papa Parse. Built `/cards/import`: pick a file, see a preview by lesson with any skipped rows and why, then import in one go.
- Moved the field rules to `lib/card-rules.ts`, so the forms and the import share them. The CSV reader is in `lib/csv-import.ts`, and it runs in the browser for the preview and again on the server before saving.
- Added a message for files not saved as CSV UTF-8, and skipped words already in my word bank, so importing twice is safe.

## Bug caught

- The agent found this one by reading my real spreadsheet, without saving anything. The totals looked off, so it checked: rows 166, 167 and 168 had Lessons 5, 6 and 7, but their topic belongs to Lesson 4. Row 166 would have gone quietly into the wrong lesson.
- It added a check that skips a row when its topic doesn't match its lesson number. I was asked to change those cells to 4 in Excel.
- The preview also said "1 words", which it fixed to "1 word".

## How it was tested

- A sample file in the old encoding showed the "save as CSV UTF-8" message. A file with no Lesson column showed a missing-column message.
- `samples/vocab-sample.csv` previewed 4 good words and 2 bad rows. Import saved 4, with the comma inside a word's meaning kept. Importing it again added 0 and skipped 4.
- My real spreadsheet, read only: 257 words ready (45 / 46 / 47 / 69 / 50 by lesson) and the 3 rows flagged.
- No server errors.
- **Cleanup:** the 4 test words were deleted, back to 0 words.

## Differences from the plan

- PLAN.md says 257 words, but the spreadsheet had 260 rows at import time.
- The import doesn't create new lessons, and the Topic column is only used for the check.

## Prompt 29

> Works, start feature 6

## What the agent did

- Opened Issue #17. Wrote `supabase/migrations/003_stars.sql`: a junction table with (user_id, card_id) as its primary key, row-level security, and stars deleted along with their word.
- Added a ☆/★ button in My words and on each word's page, and a Starred page. The star changes the instant I click, then saves in the background. The word list moved to `app/cards/card-list.tsx`.
- It waited for me to run the SQL before testing, because My words can't load without the table.

## Prompt 30

> Done, it ran

## How it was tested

With my 260 imported words:

- Starred two words, and each turned into a red ★ right away and stayed after a reload.
- The Starred page showed "2 words to practice" with just those two.
- Un-starred one on the Starred page and one on its word page, and both worked.
- Added a test word, starred it and deleted it, and its star went with it.
- No server errors.
- **Cleanup:** the test word was deleted and the two real words un-starred, back to 260 words and 0 stars.

## Differences from the plan

- `user_id` is a `uuid`, the same as the other tables. Otherwise none.

## Prompt 31

> Yes, I want to switch to a different chat to be efficient. Update the claude.md so I can pass all our information onto the next chat

## What the agent did

- Updated `CLAUDE.md` with where things stood, how the code is organized, how to test safely, and what to do after a merge. PR #19, on branch `docs/claude-md-handoff`.
- PR #19 has no linked Issue.

## Prompt 32

> Yes, do both

(The agent had suggested merging PR #19 and stopping its dev server.)

## What the agent did

- Merged PR #19, confirmed Vercel's check passed on `b3db2af`, and stopped its dev server so the next chat could start its own.
