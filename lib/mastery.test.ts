// Run with `npm test` (Node's built-in test runner).
import { test } from "node:test";
import assert from "node:assert/strict";
import { lessonMastery, wordProgress, type Answer, type Word } from "./mastery.ts";

const NOW = new Date("2026-11-20T12:00:00Z");

// An answer given this many days before NOW.
const daysAgo = (days: number, correct: boolean): Answer => ({
  reviewed_at: new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000).toISOString(),
  correct,
});

// `count` "Got it"s in a row, the last one `days` days before NOW.
const gotItInARow = (count: number, days: number): Answer[] =>
  Array.from({ length: count }, (_, i) => daysAgo(days + (count - 1 - i), true));

const statusOf = (answers: Answer[]) => wordProgress(answers, NOW).status;

const word = (id: number, answers: Answer[]): Word => ({
  id,
  korean: `단어${id}`,
  english: `word ${id}`,
  answers,
});

test("a word I've never studied is New", () => {
  assert.equal(statusOf([]), "new");
});

test("a word stays Known longer the more times in a row I get it right", () => {
  const windows: [streak: number, days: number][] = [
    [1, 2],
    [2, 4],
    [3, 7],
    [4, 14],
    [9, 14], // 4 or more is always 14 days
  ];
  for (const [streak, days] of windows) {
    assert.equal(statusOf(gotItInARow(streak, days)), "known", `${streak} in a row, ${days} days later`);
    assert.equal(statusOf(gotItInARow(streak, days + 0.01)), "fading", `${streak} in a row, just over ${days} days later`);
  }
});

test("my last answer being 'Missed it' makes a word Missed, however long ago", () => {
  assert.equal(statusOf([daysAgo(1, true), daysAgo(0, false)]), "missed");
  assert.equal(statusOf([daysAgo(100, false)]), "missed");
});

test("'Missed it' resets the count to 0", () => {
  const answers = [...gotItInARow(5, 10), daysAgo(3, false), daysAgo(3, true)];
  assert.equal(wordProgress(answers, NOW).streak, 1);
  // One right answer after the miss only lasts 2 days, not 14.
  assert.equal(statusOf(answers), "fading");
});

test("PLAN.md example: 31 known · 8 fading · 4 missed · 3 new is 67% mastered", () => {
  const words = [
    ...Array.from({ length: 31 }, (_, i) => word(i, [daysAgo(1, true)])),
    ...Array.from({ length: 8 }, (_, i) => word(100 + i, [daysAgo(3, true)])),
    ...Array.from({ length: 4 }, (_, i) => word(200 + i, [daysAgo(1, false)])),
    ...Array.from({ length: 3 }, (_, i) => word(300 + i, [])),
  ];
  const mastery = lessonMastery(words, NOW);
  assert.deepEqual(
    [mastery.known, mastery.fading, mastery.missed, mastery.new, mastery.total, mastery.percent],
    [31, 8, 4, 3, 46, 67],
  );
});

test("a lesson with no words is 0% mastered (and doesn't crash)", () => {
  assert.equal(lessonMastery([], NOW).percent, 0);
});

test("weakest is the most-missed words; fading is a separate tier, most overdue first", () => {
  const mastery = lessonMastery(
    [
      word(1, [daysAgo(1, true)]), // Known
      word(2, []), // New
      word(3, [daysAgo(3, true)]), // Fading, 1 day overdue
      word(4, [daysAgo(9, true)]), // Fading, 7 days overdue
      word(5, [daysAgo(2, false)]), // Missed once
      word(6, [daysAgo(5, false), daysAgo(2, false)]), // Missed twice
    ],
    NOW,
  );
  assert.deepEqual(mastery.weakest.map((w) => w.id), [6, 5]);
  assert.equal(mastery.weakest[0].timesMissed, 2);
  assert.deepEqual(mastery.fadingWords.map((w) => w.id), [4, 3]);
});

test("a word missed in the past leaves Weakest once I get it right", () => {
  const mastery = lessonMastery([word(1, [daysAgo(3, false), daysAgo(1, true)])], NOW);
  assert.deepEqual(mastery.weakest, []);
  assert.equal(mastery.known, 1);
});

test("many missed words don't push the fading words off their list", () => {
  const words = [
    ...Array.from({ length: 8 }, (_, i) => word(i, [daysAgo(1, false)])),
    word(100, [daysAgo(3, true)]),
  ];
  const mastery = lessonMastery(words, NOW);
  assert.equal(mastery.weakest.length, 5); // only the top 5 are listed
  assert.equal(mastery.missed, 8);
  assert.deepEqual(mastery.fadingWords.map((w) => w.id), [100]);
});
