# Feature 10: Lesson mastery — prompt log

Agent: Claude Code · Issue #30 · Branch `feature/mastery`

## Prompt 1

> Works, start feature 10

## What the agent did

- Each lesson tile on the home page now has a green progress bar, a line like "31 known · 8 fading · 4 missed · 3 new (67% mastered)", and a **Weakest words** list that opens on click. Each word in the list links to its page.
- **Nothing new is stored and no migration was needed.** `getLessonMastery()` in `lib/data.ts` loads my cards and all of my reviews each time the home page loads, and `lib/mastery.ts` works out each word's status from its answers (PLAN.md section 3).
- **How a status is worked out:** `wordProgress()` goes through a word's answers from oldest to newest. Each "Got it" adds 1 to the count of right answers in a row, and each "Missed it" resets it to 0. Then:
  - no answers → **New**;
  - the count is 0 (my last answer was "Missed it") → **Missed**;
  - otherwise, the time since my last answer decides: within the allowed days (1 → 2, 2 → 4, 3 → 7, 4 or more → 14) → **Known**; longer than that → **Fading**.
- **The 1,000-row limit:** Supabase returns at most 1,000 rows per request. A word's status needs its whole history, so stopping at 1,000 would make statuses wrong once I had more answers than that. `fetchAllRows()` keeps asking for the next 1,000 until there are no more.
- **Automated tests:** `lib/mastery.test.ts` runs with `npm test` and covers every Known window and the moment just after it, "Missed it" resetting the count, the PLAN.md example (31 known · 8 fading · 4 missed · 3 new = 67%), a lesson with no words, and the order of the weakest words.

## Design choices

- **Weakest words:** PLAN.md doesn't define them, so the list shows up to 5 per lesson: Missed words first (most often missed at the top), then Fading words (most overdue at the top). Known and New words aren't listed, because I haven't shown that I'm weak on a word I've never tried.
- **"Too long" is counted in exact hours** since my last answer, so 2 days means 48 hours. That means it doesn't depend on a time zone, and the server can work it out.

## How it was tested

- `npm test`: 13 of 13 pass (5 dashboard, 8 mastery).
- Locally in the browser with my real data: the 4 words I've answered show as Known across Lessons 3, 4 and 5, and everything else is New.
- With a test word (테스트 = "test word (delete me)") in Lesson 1, studied through the Starred deck so no real words were answered:
  - after one "Missed it": "0 known · 0 fading · 1 missed · 45 new (0% mastered)", and the word is listed as "Missed";
  - after a second miss: "Missed 2 times";
  - after a "Got it": "1 known · 0 fading · 0 missed · 45 new (2% mastered)", and the list is gone.
- Checked on a phone-sized screen: no sideways scrolling. No console or server errors.
- **Not seen in the browser:** a word turning Fading (that takes days, or a review with a made-up old date) and loading more than 1,000 rows (I don't have that many). Fading is covered by the automated tests; the 1,000-row loop has not been run on more than one page of data.
- **Cleanup:** deleted the test word, which also deleted its star and its 3 reviews. The dashboard is back to 260 words and 4 of 4, and Starred is empty.

## Differences from the plan

- PLAN.md doesn't say where this goes, so it's on the existing home page lesson tiles instead of a new page.
- Answers in one sitting all count toward "in a row", as the plan's rule is written, so getting a word right 4 times in one session makes it Known for 14 days.
