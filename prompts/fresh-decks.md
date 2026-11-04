# Random mix: avoid repeats — prompt log

Agent: Claude Code · Issue #32 · Branch `feature/fresh-decks`

This adds to feature 8 (Study mode). It isn't a numbered feature in PLAN.md.

## Prompts

> Is there a way to mitigate users seeing the same words multiple times in one session? if I am a user and I create multiple shuffled decks, I don't want to see the same cards every time.

The agent suggested picking the least recently studied words, and explained the limits.

> Yes, do both

("Both" meant merging PR #31 and building this.)

## What the agent did

- **The problem:** one deck never repeats a card, but each new random deck picked from all my words with no memory of the last one.
- **The fix:** `pickLeastRecent()` in `lib/random-set.ts` picks:
  1. cards I've never answered;
  2. then cards by how many whole days it's been since I last answered them, the longest first, so cards answered in the last 24 hours come last.
- Cards in the same group are in a random order, and the finished deck is shuffled again so the oldest cards aren't all at the start.
- **Why groups instead of a strict oldest-first order:** answers from one session are seconds apart. With a strict order, once I'd been through every word, each new deck would be an exact repeat of an earlier deck.
- **Nothing new is stored and no migration was needed.** `getLastAnswered()` in `lib/data.ts` reads when each card was last answered from `reviews`. This means it works on any device.
- Updated the description on the Study page to say how cards are picked.

## Limits

- Only answered cards count as seen, so cards I didn't reach in a deck I quit early can come back.
- Words I just missed won't come back quickly in a random deck. "Study the missed words" and the lesson decks are for those.
- Lesson and Starred decks still include all of their words, so they aren't affected.

## How it was tested

- `npm test`: 20 of 20 pass, including 5 decks of 50 from 260 words with no card repeated, and new decks not being repeats once every card has been answered.
- Locally in the browser, without answering any cards: I loaded 30 decks of 50 and none contained any of the 4 words I've answered. Picking at random across all 260 words, each of those would have been in about 1 deck in 5.
- Opened a 5-card deck and the Study page: both display correctly.
- **Not run for real:** answering a whole deck and then making a new one, because that would have added test answers to my real words. The automated test covers this instead. No data was changed, so there was nothing to clean up.

## Differences from the plan

- PLAN.md's random mix doesn't exist in the original plan (I added it during feature 8), and this changes how it picks cards: not purely at random any more.
