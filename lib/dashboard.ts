// The dashboard's math, kept separate (no database, no React) so it can be
// tested on its own: see lib/dashboard.test.ts and `npm test`.

export type ReviewTime = { reviewed_at: string; correct: boolean };

export type Day = {
  date: string; // "2026-11-03", in my own time zone
  label: string; // "Nov 3"
  reviews: number;
  correct: number;
};

// "70" for 7 out of 10, rounded to a whole percent. null when there are no
// reviews yet, so the page can say "—" instead of a misleading 0%.
export function percentCorrect(correct: number, total: number): number | null {
  if (total === 0) return null;
  return Math.round((correct / total) * 100);
}

// The calendar date of a moment in a time zone, as "YYYY-MM-DD".
// (Canada's date format happens to be exactly YYYY-MM-DD.)
export function dateIn(timeZone: string, moment: Date): string {
  return moment.toLocaleDateString("en-CA", { timeZone });
}

// One entry per day for the last `days` days, ending today (oldest first),
// counting my reviews and how many were "Got it". Days are in my time
// zone, so a review at 11pm in Berkeley counts on that day, not the next
// one (the server's clock is in UTC).
export function reviewsPerDay(
  reviews: ReviewTime[],
  { days, now, timeZone }: { days: number; now: Date; timeZone: string },
): Day[] {
  const result: Day[] = [];
  const byDate = new Map<string, Day>();

  for (let i = days - 1; i >= 0; i--) {
    // Noon UTC on each earlier day, stepping back whole days. Starting from
    // today's date at noon avoids daylight-saving edge cases.
    const today = dateIn(timeZone, now);
    const moment = new Date(`${today}T12:00:00Z`);
    moment.setUTCDate(moment.getUTCDate() - i);
    const date = moment.toISOString().slice(0, 10);
    const label = moment.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
    const day = { date, label, reviews: 0, correct: 0 };
    result.push(day);
    byDate.set(date, day);
  }

  for (const review of reviews) {
    const day = byDate.get(dateIn(timeZone, new Date(review.reviewed_at)));
    if (!day) continue; // older than the window
    day.reviews += 1;
    if (review.correct) day.correct += 1;
  }

  return result;
}
