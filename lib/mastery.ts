// The lesson mastery math, kept separate (no database, no React) so it can be
// tested on its own: see lib/mastery.test.ts and `npm test`.

export type Status = "new" | "known" | "fading" | "missed";

export type Answer = { reviewed_at: string; correct: boolean };

export type Word = {
  id: number;
  korean: string;
  english: string;
  answers: Answer[]; // oldest first
};

export type WeakWord = {
  id: number;
  korean: string;
  english: string;
  status: "missed" | "fading";
  timesMissed: number;
};

export type LessonMastery = {
  total: number;
  known: number;
  fading: number;
  missed: number;
  new: number;
  percent: number; // Known words ÷ all words in the lesson
  weakest: WeakWord[];
};

const DAY_MS = 24 * 60 * 60 * 1000;

// How many days a word stays Known after this many "Got it"s in a row.
export function daysKnown(streak: number): number {
  if (streak >= 4) return 14;
  if (streak === 3) return 7;
  if (streak === 2) return 4;
  if (streak === 1) return 2;
  return 0;
}

// Works out one word's status by replaying all of its answers in order.
// "Too long" is counted in exact hours since the last answer, so it doesn't
// depend on a time zone: 2 days means 48 hours.
export function wordProgress(answers: Answer[], now: Date) {
  let streak = 0;
  let timesMissed = 0;
  for (const answer of answers) {
    if (answer.correct) {
      streak += 1;
    } else {
      streak = 0; // a "Missed it" resets the count
      timesMissed += 1;
    }
  }

  const last = answers.at(-1);
  if (!last) return { status: "new" as Status, streak, timesMissed, overdueMs: 0 };
  if (streak === 0) return { status: "missed" as Status, streak, timesMissed, overdueMs: 0 };

  const elapsedMs = now.getTime() - new Date(last.reviewed_at).getTime();
  const overdueMs = elapsedMs - daysKnown(streak) * DAY_MS;
  return {
    status: (overdueMs > 0 ? "fading" : "known") as Status,
    streak,
    timesMissed,
    overdueMs,
  };
}

// The counts for one lesson, plus its weakest words: Missed words first (the
// most often missed at the top), then Fading words (the most overdue at the
// top). New words aren't "weak": I just haven't tried them yet.
export function lessonMastery(words: Word[], now: Date, weakestCount = 5): LessonMastery {
  const progress = words.map((word) => ({ word, ...wordProgress(word.answers, now) }));
  const withStatus = (status: Status) => progress.filter((p) => p.status === status);

  const missed = withStatus("missed").sort((a, b) => b.timesMissed - a.timesMissed);
  const fading = withStatus("fading").sort((a, b) => b.overdueMs - a.overdueMs);
  const known = withStatus("known").length;

  return {
    total: words.length,
    known,
    fading: fading.length,
    missed: missed.length,
    new: withStatus("new").length,
    percent: words.length === 0 ? 0 : Math.round((known / words.length) * 100),
    weakest: [...missed, ...fading].slice(0, weakestCount).map((p) => ({
      id: p.word.id,
      korean: p.word.korean,
      english: p.word.english,
      status: p.status as WeakWord["status"],
      timesMissed: p.timesMissed,
    })),
  };
}
