# Feature 10: Lesson mastery — prompt log

Agent: Claude Code · Issue #30 · Branch `feature/mastery`

## Prompt 1

> Works, start feature 10

## What the agent did

- Each lesson tile on the home page now has a green progress bar, a line like "31 known · 8 fading · 4 missed · 3 new (67% mastered)", and a list of words to review that opens on click. Each word in the list links to its page.
- **Nothing new is stored and no migration was needed.** `getLessonMastery()` in `lib/data.ts` loads my cards and all of my reviews each time the home page loads, and `lib/mastery.ts` works out each word's status from its answers (PLAN.md section 3).
- **How a status is worked out:** `wordProgress()` goes through a word's answers from oldest to newest. Each "Got it" adds 1 to the count of right answers in a row, and each "Missed it" resets it to 0. Then:
  - no answers → **New**;
  - the count is 0 (my last answer was "Missed it") → **Missed**;
  - otherwise, the time since my last answer decides: within the allowed days (1 → 2, 2 → 4, 3 → 7, 4 or more → 14) → **Known**; longer than that → **Fading**.
- **The 1,000-row limit:** Supabase returns at most 1,000 rows per request. A word's status needs its whole history, so stopping at 1,000 would make statuses wrong once I had more answers than that. `fetchAllRows()` keeps asking for the next 1,000 until there are no more.
- **Automated tests:** `lib/mastery.test.ts` runs with `npm test` and covers every Known window and the moment just after it, "Missed it" resetting the count, the PLAN.md example (31 known · 8 fading · 4 missed · 3 new = 67%), a lesson with no words, and the order of the weakest words.

## Design choices

- **Words to review:** PLAN.md doesn't define "weakest", so see Prompt 2 for how the two lists work. New words aren't listed, because I haven't shown that I'm weak on a word I've never tried.
- **"Too long" is counted in exact hours** since my last answer, so 2 days means 48 hours. That means it doesn't depend on a time zone, and the server can work it out.

## How it was tested

- `npm test`: 14 of 14 pass (5 dashboard, 9 mastery; the count includes the tests changed in Prompt 2).
- Locally in the browser with my real data: the 4 words I've answered show as Known across Lessons 3, 4 and 5, and everything else is New.
- With a test word (테스트 = "test word (delete me)") in Lesson 1, studied through the Starred deck so no real words were answered:
  - after one "Missed it": "0 known · 0 fading · 1 missed · 45 new (0% mastered)", and the word is on the list;
  - after a second miss: the list says "Missed 2 times";
  - after a "Got it": "1 known · 0 fading · 0 missed · 45 new (2% mastered)", and the word is off the list.
- Checked on a phone-sized screen: no sideways scrolling. No console or server errors.
- **Not run for real:** a word turning Fading on its own (that takes days; see Prompt 2 for how the list was checked) and loading more than 1,000 rows (I don't have that many). The 1,000-row loop has not been run on more than one page of data.
- **Cleanup:** deleted the test word, which also deleted its star and its 3 reviews. The dashboard is back to 260 words and 4 of 4, and Starred is empty.

## Differences from the plan

- PLAN.md doesn't say where this goes, so it's on the existing home page lesson tiles instead of a new page.
- Answers in one sitting all count toward "in a row", as the plan's rule is written, so getting a word right 4 times in one session makes it Known for 14 days.

## Prompt 2

> Weakest should be words that are missed the most. Fading should be a tier below, those might be known but just haven't been tested in a while.

## What the agent did

- Split the single list into two, under **Words to review** on each lesson tile:
  - **Weakest · missed the most:** words whose last answer was "Missed it", the most often missed at the top, up to 5, each labeled "Missed once" or "Missed 3 times".
  - **Fading · not tested in a while:** a separate tier below, the most overdue at the top, up to 5.
- Before this, Fading words were part of "Weakest words" and could get pushed off the list by 5 missed words. Each tier now has its own 5 places.
- **A decision to check:** a word leaves Weakest as soon as I get it right, even if I've missed it many times before. Misses are permanent history, so otherwise a word could never leave the list.
- **How it was tested:** new automated tests cover the two tiers, and a past miss leaving Weakest. To see the Fading list in the browser without faking any data, I temporarily changed the code so that 1 "Got it" lasts 0 days, and my 4 real answered words showed up under Fading. A test word in Lesson 3, missed once, showed under Weakest above them. Then I undid the code change and deleted the test word (with its star and 1 review).
