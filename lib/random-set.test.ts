// Run with `npm test` (Node's built-in test runner).
import { test } from "node:test";
import assert from "node:assert/strict";
import { pickLeastRecent } from "./random-set.ts";

const NOW = new Date("2026-11-20T12:00:00Z");
const hoursAgo = (hours: number) => new Date(NOW.getTime() - hours * 60 * 60 * 1000).toISOString();
const cards = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => ({ id: from + i }));
const ids = (deck: { id: number }[]) => deck.map((c) => c.id).sort((a, b) => a - b);

test("cards I've never answered come before cards I've answered", () => {
  const lastAnswered = new Map([1, 2, 3].map((id) => [id, hoursAgo(100)]));
  const deck = pickLeastRecent(cards(1, 6), lastAnswered, 3, NOW);
  assert.deepEqual(ids(deck), [4, 5, 6]);
});

test("after that, the cards I answered longest ago come first", () => {
  const lastAnswered = new Map([
    [1, hoursAgo(1)],
    [2, hoursAgo(60)],
    [3, hoursAgo(30)],
    [4, hoursAgo(200)],
  ]);
  const deck = pickLeastRecent(cards(1, 4), lastAnswered, 2, NOW);
  assert.deepEqual(ids(deck), [2, 4]);
});

test("5 decks of 50 from 260 words never repeat a card", () => {
  const all = cards(1, 260);
  const lastAnswered = new Map<number, string>();
  const seen = new Set<number>();
  for (let deck = 0; deck < 5; deck++) {
    for (const card of pickLeastRecent(all, lastAnswered, 50, NOW)) {
      assert.ok(!seen.has(card.id), `card ${card.id} came back in deck ${deck + 1}`);
      seen.add(card.id);
      lastAnswered.set(card.id, hoursAgo(1));
    }
  }
  assert.equal(seen.size, 250);
});

test("once every card is answered, a new deck isn't a repeat of an old one", () => {
  const all = cards(1, 260);
  const lastAnswered = new Map(all.map((card) => [card.id, hoursAgo(1)]));
  const first = pickLeastRecent(all, lastAnswered, 50, NOW);
  const second = pickLeastRecent(all, lastAnswered, 50, NOW);
  assert.notDeepEqual(ids(first), ids(second));
});

test("asking for more cards than I have gives me all of them, once each", () => {
  const deck = pickLeastRecent(cards(1, 3), new Map(), 50, NOW);
  assert.deepEqual(ids(deck), [1, 2, 3]);
});

test("the deck isn't in oldest-first order", () => {
  const all = cards(1, 50);
  const lastAnswered = new Map(all.map((card) => [card.id, hoursAgo(card.id * 24)]));
  const deck = pickLeastRecent(all, lastAnswered, 50, NOW);
  assert.notDeepEqual(deck.map((c) => c.id), ids(deck).reverse());
});
