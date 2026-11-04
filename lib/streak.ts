// The study streak math, kept separate (no database, no React) so it can be
// tested on its own: see lib/streak.test.ts and `npm test`.

import { dateIn } from "./dashboard.ts";

export type Streak = {
  days: number; // how many days in a row I've studied
  studiedToday: boolean;
};

// The date before a "YYYY-MM-DD" date. Noon UTC stays clear of daylight-saving
// edge cases.
function dayBefore(date: string): string {
  const moment = new Date(`${date}T12:00:00Z`);
  moment.setUTCDate(moment.getUTCDate() - 1);
  return moment.toISOString().slice(0, 10);
}

// Counts back through the days I studied, in my own time zone. Not having
// studied yet today doesn't break the streak, because the day isn't over: it
// only ends once a whole day has gone by with no answers.
export function studyStreak(
  answerTimes: string[],
  { now, timeZone }: { now: Date; timeZone: string },
): Streak {
  const studied = new Set(answerTimes.map((time) => dateIn(timeZone, new Date(time))));
  const today = dateIn(timeZone, now);
  const studiedToday = studied.has(today);

  let days = 0;
  let date = studiedToday ? today : dayBefore(today);
  while (studied.has(date)) {
    days += 1;
    date = dayBefore(date);
  }
  return { days, studiedToday };
}
