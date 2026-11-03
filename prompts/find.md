# Feature 7: Find things — prompt log

Agent: Claude Code · Issue #20 · Branch `feature/find`

## Prompt 1

> Start feature 7

## What the agent did

- Added a search and filter bar to the top of **My words** (`app/cards/card-filters.tsx`):
  - A search box that matches the **Korean or the English** (upper or lower case doesn't matter). It waits until I stop typing for a moment (0.3 s) before searching, so it doesn't reload on every key.
  - A **lesson** menu (All lessons, or one lesson like "Lesson 2 · 학교생활 (School life)").
  - A **Starred only** checkbox.
  - A **Sort** menu: Newest first, 가나다 order, or By lesson (lesson number, then 가나다 inside each lesson).
- The choices are saved in the page's URL, e.g. `/cards?q=school&lesson=2&starred=1&sort=korean`. That means a search survives a reload, the Back button works, and I could bookmark "Lesson 3, starred" before a quiz. `lib/card-filters.ts` reads the URL, and anything unexpected (like `?sort=bogus`) falls back to the default instead of breaking the page.
- The **database does the searching** (`getCards()` in `lib/data.ts`), not the browser: Supabase's `ilike` ("contains, ignoring case") on the Korean and English columns, `lesson_id = …` for the lesson, the existing `stars!inner` for starred, and `order(...)` for sorting.
- 가나다 order works with a plain alphabetical sort, because Unicode stores Hangul syllables in 가나다 order (가, 가게, 가다 … 홍콩, 화요일).
- The count shows "2 of 260 words" while searching or filtering, and "No words match. Clear the search and filters." when nothing matches.

## Bug caught

- **Symbols in a search.** Supabase's "Korean or English" filter is written as text like `korean.ilike.%학교%,english.ilike.%학교%`. A search with a comma or bracket, like "(humble)", would have broken that text, and `%` or `_` would have acted as wildcards ("match anything"), so searching `%` would have shown all 260 words. The agent escapes the search text so every symbol is matched as plain text. Checked: "(humble)" finds 저 and 제, "all right;" finds 괜찮다, and `%` or `_` find nothing.
- **Search box not clearing.** Clicking "Clear the search and filters" reset the URL and the list, but the search box still showed the old text, because the box keeps its own copy of what I typed. The agent made the box update whenever the URL's search changes from somewhere else (the Clear link or the Back button).

## How it was tested

Locally in the browser, logged in, with my 260 words:

- Typed 학교 → "2 of 260 words": 학교 and 대학교, and the cursor stayed in the box.
- Searched SCHOOL (capitals) → 4 words with "school" in the English.
- Starred 학교, ticked Starred only → just 학교. Then picked Lesson 3 → "No words match".
- Clicked "Clear the search and filters" → back to 260 words, with the box, lesson menu and checkbox all reset.
- By lesson → all 260 words, Lesson 1 through 5 in order. 가나다 order → Hangul in dictionary order.
- `?lesson=abc&sort=bogus` → ignored, shows all words newest first.
- Checked on a phone-sized screen. No server errors.
- Cleanup: un-starred 학교 (Starred page is empty again). No words were added, changed or deleted.

## Differences from the plan

- The Starred page from feature 6 stays as it is; My words also has a "Starred only" checkbox so it can be combined with search and lesson.
- No database changes were needed.

## Prompt 2 (after merging)

> It works, but there is input lag when typing into the search bar

## Bug caught: the search box lost what I typed

- **What happened:** while a search was loading, the box jumped back to the previous search for a moment, and letters typed during that moment could be lost. Recorded in the browser: typing "sch", pausing, then "ool" showed "sch" → "" → "ool" → "sch" → "ool", and the box ended at **"ool"** instead of "school". On localhost it was quick; on the live site the database is further away, so it felt like lag.
- **Why:** the page keeps showing the old results until the new ones arrive. The box's "copy the search from the URL if it changed somewhere else" check (added for the Clear link) compared the URL with what I'd just sent, saw they didn't match yet, and put the old text back.
- **Fix** (`app/cards/card-filters.tsx`, issue #22, branch `fix/search-box`): the box only copies the URL when the URL actually changes, and never while my own search is still loading.
- **Tested:** the same typing now records just "sch" → "school", and the list shows the 4 "school" words. The Clear link and the Back button still update the box. No server errors.
