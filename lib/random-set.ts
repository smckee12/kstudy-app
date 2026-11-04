// The "random set" study option: N cards picked from all lessons.
// The number comes from the URL (/study/random?count=20), so it's checked
// here: anyone can type any URL, not just use the form.

import { shuffle } from "./shuffle.ts";

export const RANDOM_SET_MAX = 50;
export const RANDOM_SET_DEFAULT = 20;

// A whole number from 1 to 50, or null if it's anything else
// ("", "abc", "0", "2.5", "51"…).
export function parseCount(value: string | string[] | undefined): number | null {
  const text = (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
  if (!/^\d+$/.test(text)) return null;
  const count = Number(text);
  return count >= 1 && count <= RANDOM_SET_MAX ? count : null;
}

const DAY_MS = 24 * 60 * 60 * 1000;

// Picks `count` cards, the ones I've studied least recently first, so that
// each new deck shows me different cards:
//   1. Cards I've never answered.
//   2. Then cards by how many whole days it's been since I last answered them,
//      the longest first. So cards from today's decks come last.
// Cards in the same group are in a random order. Without that, once I'd been
// through every card, each deck would be an exact repeat of an earlier one.
// The deck itself is shuffled at the end, so the oldest cards aren't all first.
export function pickLeastRecent<T extends { id: number }>(
  cards: T[],
  lastAnswered: Map<number, string>,
  count: number,
  now: Date,
): T[] {
  const daysSinceAnswered = (card: T) => {
    const last = lastAnswered.get(card.id);
    if (!last) return Number.MAX_SAFE_INTEGER; // never answered: always first
    return Math.floor((now.getTime() - new Date(last).getTime()) / DAY_MS);
  };
  // sort() keeps equal cards in their shuffled order.
  const picked = shuffle(cards)
    .sort((a, b) => daysSinceAnswered(b) - daysSinceAnswered(a))
    .slice(0, count);
  return shuffle(picked);
}
