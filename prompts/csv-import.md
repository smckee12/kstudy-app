# Feature 5: CSV import — prompt log

Agent: Claude Code · Issue #15 · Branch `feature/csv-import`

## Prompt 1

> Works, start feature 5

## What the agent did

- Read the column names of my `Korean_Vocab_Bank.xlsx` (Vocab Bank sheet: Lesson, Topic, Korean, Pronunciation, Polite form, English meaning, Notes) so the import matches it. The spreadsheet itself is not in the repo.
- Installed **Papa Parse**, which reads CSV files correctly, including Korean text and commas inside quotes ("책, 공책").
- New page `/cards/import` ("Import CSV" button on My words):
  1. I pick a CSV file.
  2. The page reads it in the browser and shows a **preview**: how many words are ready for each lesson, and which rows will be skipped and why (e.g. "Row 6: Please add the Korean word.").
  3. I click "Import N words", and a Server Action (`app/actions/import.ts`) checks the file again and saves all the words in one go.
- **Encoding check:** if the file isn't UTF-8 (Excel's plain "CSV" format garbles Korean), the page says so and explains how to save as "CSV UTF-8" instead.
- **No duplicates:** words already in my word bank (same lesson, Korean and English) are skipped, so importing the same file twice is safe.
- **Same rules everywhere:** feature 4's field checks moved to `lib/card-rules.ts`, so the add form, edit form and CSV import all use the same rules. The CSV reader is in `lib/csv-import.ts`.
- Added `samples/vocab-sample.csv`, a 6-row test file with 4 good rows and 2 bad ones.

## Bug caught

Testing the reader on my real spreadsheet (preview only, nothing saved) showed that **rows 166–168 have Lesson 5, 6 and 7, but their topic is 가족과 집 (Lesson 4)**. It looks like dragging a cell in Excel counted up instead of copying the 4. Lessons 6 and 7 don't exist, so those rows were caught, but row 166 would have quietly gone into Lesson 5. The agent added a check: if a row's Topic doesn't match its lesson number's topic, the row is skipped with a message telling me to check the lesson number. **I need to change those three cells to 4 in my spreadsheet before importing.**

Also, the preview said "1 words"; fixed to "1 word".

## How it was tested

Locally in the browser, logged in:

- Sample file saved in the old Korean encoding (CP949) → the "save as CSV UTF-8" message.
- File without a Lesson column → "This file is missing a column: Lesson."
- `samples/vocab-sample.csv` (with Excel's UTF-8 marker at the start) → preview: 4 words in Lessons 1, 2, 3 and 5; "Row 6: Please add the Korean word."; "Row 7: There's no Lesson 6 in your lessons."
- Import → "Imported 4 words." My words showed all 4; 먹다 kept its pronunciation [먹따] and polite form 먹어요; "책, 공책" kept its comma.
- Same file again → "Imported 0 words. Skipped 4 words that were already in your word bank."
- Deleted the 4 test words afterwards.
- My real spreadsheet (read only, not imported): 257 words ready (Lesson 1: 45, 2: 46, 3: 47, 4: 69, 5: 50), and the 3 wrong-lesson rows above skipped.

## Differences from the plan

- PLAN.md says 257 words; the spreadsheet now has 260 rows. 257 import cleanly, and the other 3 are the wrong-lesson rows.
- The Topic column isn't saved, because each lesson already has its topic. It's only used to double-check lesson numbers.
- The import doesn't create new lessons. A row for a lesson that isn't in my lessons yet (like Lesson 6) is skipped.
