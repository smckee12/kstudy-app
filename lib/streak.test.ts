// Run with `npm test` (Node's built-in test runner).
import { test } from "node:test";
import assert from "node:assert/strict";
import { studyStreak } from "./streak.ts";

const timeZone = "America/Los_Angeles";
const NOW = new Date("2026-11-20T20:00:00Z"); // Nov 20, noon in Berkeley
const streak = (times: string[], now = NOW) => studyStreak(times, { now, timeZone });

test("no answers is no streak", () => {
  assert.deepEqual(streak([]), { days: 0, studiedToday: false });
});

test("three days in a row, including today, is 3", () => {
  const times = ["2026-11-18T20:00:00Z", "2026-11-19T20:00:00Z", "2026-11-20T18:00:00Z"];
  assert.deepEqual(streak(times), { days: 3, studiedToday: true });
});

test("many answers on one day only count as one day", () => {
  const times = ["2026-11-20T17:00:00Z", "2026-11-20T18:00:00Z", "2026-11-20T19:00:00Z"];
  assert.equal(streak(times).days, 1);
});

test("not having studied yet today doesn't break the streak", () => {
  const times = ["2026-11-18T20:00:00Z", "2026-11-19T20:00:00Z"];
  assert.deepEqual(streak(times), { days: 2, studiedToday: false });
});

test("a whole day with no answers ends the streak", () => {
  const times = ["2026-11-17T20:00:00Z", "2026-11-18T20:00:00Z"]; // nothing on Nov 19
  assert.deepEqual(streak(times), { days: 0, studiedToday: false });
});

test("a gap only counts the days after it", () => {
  const times = ["2026-11-16T20:00:00Z", "2026-11-19T20:00:00Z", "2026-11-20T18:00:00Z"];
  assert.equal(streak(times).days, 2);
});

test("days are in my time zone, not the server's", () => {
  // Nov 19, 10pm in Berkeley is already Nov 20 in UTC.
  assert.deepEqual(streak(["2026-11-20T06:00:00Z"]), { days: 1, studiedToday: false });
});

test("the streak carries across the daylight-saving change", () => {
  // US clocks went back on Nov 1, 2026.
  const times = ["2026-10-31T20:00:00Z", "2026-11-01T20:00:00Z", "2026-11-02T20:00:00Z"];
  assert.equal(streak(times, new Date("2026-11-02T21:00:00Z")).days, 3);
});

test("the streak carries across a month", () => {
  const times = ["2026-10-31T20:00:00Z", "2026-11-01T20:00:00Z"];
  assert.equal(streak(times, new Date("2026-11-01T21:00:00Z")).days, 2);
});
