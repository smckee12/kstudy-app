# Feature 11: Study streak — prompt log

Agent: Claude Code · Issue #34 · Branch `feature/streak`

## Prompt 1

> Works, start feature 11

## What the agent did

- Added a **Study streak** tile at the top of **Your progress** on the home page, like "🔥 2 days · You studied today". The other four tiles stay in their row below it.
- **Nothing new is stored and no migration was needed.** The streak is worked out from `reviews` each time the page loads (PLAN.md section 3).
- **How it's counted:** `studyStreak()` in `lib/streak.ts` turns my answers into a list of dates I studied, then counts back one day at a time from today until it reaches a day with no answers.
- **Time zones:** as with the chart, my browser works out the dates, because the server's clock is on UTC. A 10pm answer in Berkeley counts for that day.
- **Every answer is needed**, because a streak can go back any number of days, so `getDashboardData()` loads them 1,000 rows at a time. Before sending them to the browser it cuts each time down to the minute and removes duplicates, which keeps the page small. Rounding to the minute can't move an answer to a different day in any time zone.
- **Automated tests:** `lib/streak.test.ts` runs with `npm test` and covers no answers, several days in a row, many answers on one day, not having studied yet today, a gap, the 10pm case, the daylight-saving change, and crossing into a new month.

## Design choices

- **Not having studied yet today doesn't break the streak**, because the day isn't over. The tile says "Study today to keep it going". The streak only ends once a whole day has gone by with no answers, and then it shows "0 days · Study today to start a streak".
- **Its own full-width tile** rather than a fifth small one, which wouldn't fit evenly in the row.
- **Only the current streak** is shown, not a best-ever streak, because that's what the user story asks for.

## How it was tested

- `npm test`: 29 of 29 pass. `npm run build` passes.
- Locally in the browser with my real data: "🔥 2 days · You studied today". That matches the chart, which shows answers on Nov 3 and Nov 4 and none before.
- Checked on a phone-sized screen: no sideways scrolling. No console errors.
- **Not seen in the browser:** the "Study today to keep it going" and "0 days" messages, because I've already studied today. The automated tests cover the math behind them.
- No test word was needed and no data was changed, so there was nothing to clean up.

## Differences from the plan

- PLAN.md doesn't say where the streak goes, so it's on the home page with the dashboard.
