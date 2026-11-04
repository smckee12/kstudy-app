// Run with `npm test` (Node's built-in test runner).
import { test } from "node:test";
import assert from "node:assert/strict";
import { percentCorrect, reviewsPerDay, type ReviewTime } from "./dashboard.ts";

// PLAN.md section 4, "Dashboard": Given I have 10 reviews and 7 of them are
// marked "Got it", when I open the dashboard, then my accuracy shows 70%.
test("10 reviews with 7 'Got it' is 70% correct", () => {
  const reviews: ReviewTime[] = Array.from({ length: 10 }, (_, i) => ({
    reviewed_at: "2026-11-03T18:00:00Z",
    correct: i < 7,
  }));
  const correct = reviews.filter((r) => r.correct).length;
  assert.equal(percentCorrect(correct, reviews.length), 70);
});

test("no reviews yet has no percentage (not 0%)", () => {
  assert.equal(percentCorrect(0, 0), null);
});

test("percent rounds to a whole number", () => {
  assert.equal(percentCorrect(2, 3), 67);
});

test("reviews are counted on the right day in my time zone", () => {
  const now = new Date("2026-11-04T06:30:00Z"); // Nov 3, 10:30pm in Berkeley
  const days = reviewsPerDay(
    [
      { reviewed_at: "2026-11-04T06:00:00Z", correct: true }, // Nov 3, 10pm Berkeley
      { reviewed_at: "2026-11-03T17:00:00Z", correct: false }, // Nov 3, 9am
      { reviewed_at: "2026-11-02T20:00:00Z", correct: true }, // Nov 2
      { reviewed_at: "2026-10-01T20:00:00Z", correct: true }, // too old: ignored
    ],
    { days: 7, now, timeZone: "America/Los_Angeles" },
  );

  assert.equal(days.length, 7);
  assert.equal(days[0].date, "2026-10-28"); // oldest first
  assert.deepEqual(days[6], { date: "2026-11-03", label: "Nov 3", reviews: 2, correct: 1 });
  assert.equal(days[5].reviews, 1);
  assert.equal(days.reduce((sum, d) => sum + d.reviews, 0), 3);
});

test("the days still line up across the daylight-saving change", () => {
  // US clocks went back on Nov 1, 2026.
  const days = reviewsPerDay([], {
    days: 5,
    now: new Date("2026-11-03T20:00:00Z"),
    timeZone: "America/Los_Angeles",
  });
  assert.deepEqual(
    days.map((d) => d.date),
    ["2026-10-30", "2026-10-31", "2026-11-01", "2026-11-02", "2026-11-03"],
  );
});
