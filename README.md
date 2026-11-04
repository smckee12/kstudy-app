# K-Study 한국어

A Korean vocab study app built from my textbook's word list. I can save words by lesson, study them as flashcards, and track how well I know each lesson over time.

**Live app:** https://kstudy-cal-app.vercel.app

## What it does

- Sign up, log in and log out. Each user only sees their own words.
- Words are grouped into my textbook's lessons, and the home page shows how many words each lesson has.
- Add a word (Korean, English and lesson, plus optional pronunciation, polite form, example sentence and notes), see all my words, open, edit, or delete a word (after an "Are you sure?" check).
- Friendly messages like "Please add the Korean word" if Korean, English or Lesson is left blank, so a half-finished card is never saved.
- Import my vocab spreadsheet as a CSV: a preview shows how many words go into each lesson and which rows have problems, and words that are already saved are skipped. Try it with [`samples/vocab-sample.csv`](samples/vocab-sample.csv).
- Star words I keep forgetting (☆ → ★) and see them all on the Starred page.
- Search my words in Korean or English, filter by lesson or starred, and sort by newest, 가나다 order, or lesson. The search is saved in the page's address, so it survives a reload.
- Study mode: study one lesson, my starred words, or a random mix of up to 50 cards from all lessons, in a shuffled order. Korean is on the front and English on the back, and I mark each card "Got it" or "Missed it". Every answer is saved, and at the end I can study just the words I missed.
- *Coming next:* a dashboard, lesson mastery and a study streak. See [PLAN.md](PLAN.md) for the full plan.

## Tools

| Tool | Used for |
| -------- | -------- |
| [Claude Code](https://claude.com/claude-code) | AI coding agent that builds each feature |
| [Next.js](https://nextjs.org) | The web app |
| [Supabase](https://supabase.com) | Database (Postgres) and sign-up / log-in |
| [Vercel](https://vercel.com) | Hosting; redeploys on every merge to `main` |
| GitHub | Code, Issues and pull requests |

## Run it locally

You'll need [Node.js](https://nodejs.org) and a free Supabase project.

1. Clone the repo and install packages:
   ```bash
   git clone https://github.com/smckee12/kstudy-app.git
   cd kstudy-app
   npm install
   ```
2. In Supabase → **SQL Editor**, run each file in [`supabase/migrations`](supabase/migrations) in order.
3. Copy `.env.example` to `.env.local` and fill in your Supabase project URL and publishable key (Supabase → **Project Settings**).
4. Start the app:
   ```bash
   npm run dev
   ```
   Then open http://localhost:3000.

## Project docs

- [PLAN.md](PLAN.md): the plan, written before building
- [prompts/](prompts): the prompts I gave the agent for each feature
