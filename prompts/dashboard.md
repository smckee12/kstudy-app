# Feature 9: Dashboard — prompt log

Agent: Claude Code · Issue #26 · Branch `feature/dashboard`

## Prompt 1

> Works, start feature 9

## What the agent did

- Put a **Your progress** dashboard at the top of the home page (`app/dashboard.tsx`), above "Your lessons", with four number tiles:
  - **Words**: how many words I have.
  - **Correct overall**: my % of "Got it" answers, with "11 of 14 answers" underneath. It shows "—" (not 0%) before I've studied.
  - **Reviews this week**: answers in the last 7 days, including today.
  - **Reviews all time**.
- A **Reviews per day** bar chart for the last 14 days, made with **Recharts** (from PLAN.md section 5). Hovering a day shows "Nov 3 · 4 reviews · 4 got it (100%)". "Show as a table" lists the same numbers, for screen readers or anyone who'd rather read than look at a chart.
- **Nothing new is stored.** `getDashboardData()` in `lib/data.ts` counts my cards and reviews each time the page loads (PLAN.md section 3: the dashboard is "calculated from `reviews`, so it can never get out of sync"). For the totals it asks the database for just the count (`head: true`) instead of downloading every row.
- **Time zones:** the server runs on UTC, which is 7–8 hours ahead of Berkeley, so an answer at 10pm would have counted as tomorrow. The server sends the times of my last ~15 days of answers, and **my browser** sorts them into days in my own time zone (`reviewsPerDay()` in `lib/dashboard.ts`).
- **Automated tests:** the math is in `lib/dashboard.ts` (no database, no React), so it can be tested on its own. `lib/dashboard.test.ts` runs with `npm test` (Node's built-in test runner) and covers:
  - the PLAN.md section 4 test: 10 reviews, 7 "Got it" → **70%**;
  - no reviews → no percentage; rounding (2 of 3 → 67%);
  - a 10pm answer in Berkeley counted on the right day; answers older than the chart ignored;
  - the days still line up across the daylight-saving change on Nov 1.
  - To make `npm test` run TypeScript directly, `package.json` now says `"type": "module"` and `tsconfig.json` allows `.ts` in imports (`allowImportingTsExtensions`).

## Design choices

- **One color, not green/red.** The first idea was to split each day's bar into green "Got it" and red "Missed it". The chart guidelines' color checker said that pair fails for red-green colorblindness (deuteranopia, the most common type: difference 5.7, the minimum is 6). So the chart shows one navy bar per day (total reviews), and accuracy has its own tile and appears in the hover tooltip. That also matches the user story: "a chart of reviews per day".
- **On the home page**, not a separate `/dashboard` page: the header already has four links and a fifth wouldn't fit on a phone.

## Bugs caught

- **Uneven day labels.** Recharts hid labels automatically, so the axis showed every other day and then four days in a row at the end. Now it labels every 3rd day counting back from today, so today always has a label and the labels fit on a phone (every 2nd day ran together and cut off "Nov 3" at 375px wide).

## How it was tested

- `npm test`: 5 of 5 pass.
- Locally in the browser with my real data (4 answers from trying study mode): 260 words, 100% ("4 of 4 answers"), 4 this week, 4 all time, one bar on Nov 3. The hover tooltip and the table view showed the same numbers.
- **The PLAN.md test, end to end with the real database:** added a test word (테스트 = "test word (delete me)"), starred it, and answered it 10 times in the Starred deck: 7 Got it, 3 Missed it (the server log shows exactly those 10 saves). Together with my 4 real answers, the dashboard showed **79% · 11 of 14 answers**, 14 this week, 14 all time, and 261 words, exactly as expected ((4 + 7) ÷ (4 + 10) = 79%).
- Checked on a phone-sized screen: tiles in two columns, no sideways scrolling. No console or server errors.
- **Cleanup:** deleted the test word, which also deleted its star and its 10 reviews. The dashboard is back to 260 words and 4 of 4, and Starred is empty. None of my real words were answered, changed or starred.

## Differences from the plan

- The dashboard is on the home page instead of its own page.
- "This week" means the last 7 days (including today), not "since Monday", so it doesn't reset to 0 every Monday morning.
- Added an "all time" reviews tile and a table view of the chart.
