"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { saveReview } from "@/app/actions/reviews";
import type { CardWithLesson } from "@/lib/data";
import { shuffle } from "@/lib/shuffle";

type Answer = { card: CardWithLesson; correct: boolean };

// One study session: a card at a time, Korean on the front, English on
// the back. Each "Got it" / "Missed it" is saved to the reviews table
// right away, so leaving halfway still keeps the answers so far.
// `newSetHref` (random mix only) adds a "New random set" button at the end.
export function StudySession({ cards, newSetHref }: { cards: CardWithLesson[]; newSetHref?: string }) {
  // Kept in state so the order stays the same for the whole session.
  const [deck, setDeck] = useState(cards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [saving, setSaving] = useState(0);
  const [unsaved, setUnsaved] = useState<Answer[]>([]);
  const [error, setError] = useState<string>();

  const card = deck[index];
  const finished = index >= deck.length;

  // Saves in the background, so the next card shows straight away.
  // If saving fails, the answer is kept so it can be tried again.
  async function save(answer: Answer) {
    setSaving((n) => n + 1);
    const result = await saveReview(answer.card.id, answer.correct).catch(() => ({
      error: "Couldn't save your answer. Check your internet connection.",
    }));
    setSaving((n) => n - 1);
    if (result.error) {
      setError(result.error);
      setUnsaved((list) => [...list, answer]);
    }
  }

  function answer(correct: boolean) {
    if (!card || !flipped) return;
    const a = { card, correct };
    setAnswers((list) => [...list, a]);
    setIndex((i) => i + 1);
    setFlipped(false);
    save(a);
  }

  function retryUnsaved() {
    const list = unsaved;
    setUnsaved([]);
    setError(undefined);
    list.forEach(save);
  }

  function startOver(nextCards: CardWithLesson[]) {
    setDeck(shuffle(nextCards));
    setIndex(0);
    setFlipped(false);
    setAnswers([]);
  }

  // Keyboard: Space flips the card, then ← = Missed it, → = Got it.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Let buttons and links handle their own Space/Enter.
      if (e.target instanceof HTMLElement && e.target.closest("button, a, input, select, textarea")) return;
      if (finished) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped(true);
      } else if (flipped && e.key === "ArrowRight") {
        answer(true);
      } else if (flipped && e.key === "ArrowLeft") {
        answer(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const savingNote = (
    <>
      {error && (
        <div role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-accent">
          {error}
          {unsaved.length > 0 && saving === 0 && (
            <button type="button" onClick={retryUnsaved} className="ml-2 font-semibold underline">
              Try saving {unsaved.length} {unsaved.length === 1 ? "answer" : "answers"} again
            </button>
          )}
        </div>
      )}
    </>
  );

  if (finished) {
    const right = answers.filter((a) => a.correct).length;
    const missed = answers.filter((a) => !a.correct).map((a) => a.card);
    const percent = Math.round((right / answers.length) * 100);

    return (
      <section className="mt-6">
        <div className="rounded-2xl bg-surface p-8 text-center">
          <p className="text-sm font-semibold text-gray-500">Done!</p>
          <p className="mt-2 text-4xl font-bold text-navy">
            {right} / {answers.length}
          </p>
          <p className="mt-1 text-gray-700">{percent}% correct</p>
          <div className="mx-auto mt-4 h-2 max-w-xs overflow-hidden rounded-full bg-gray-200">
            <div className="h-full bg-success" style={{ width: `${percent}%` }} />
          </div>
          <p className="mt-4 text-sm text-gray-500" aria-live="polite">
            {saving > 0
              ? "Saving your answers…"
              : unsaved.length > 0
                ? `${unsaved.length} ${unsaved.length === 1 ? "answer wasn't" : "answers weren't"} saved.`
                : "All answers saved."}
          </p>
        </div>

        {savingNote}

        {missed.length > 0 && (
          <div className="mt-6">
            <h2 className="font-bold text-navy">Missed ({missed.length})</h2>
            <ul className="mt-2 flex flex-col gap-1">
              {missed.map((c) => (
                <li key={c.id} className="flex gap-3 rounded-lg bg-surface px-4 py-2">
                  <span lang="ko" className="font-bold text-navy">
                    {c.korean}
                  </span>
                  <span className="text-gray-700">{c.english}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          {missed.length > 0 && (
            <button
              type="button"
              onClick={() => startOver(missed)}
              className="rounded-lg bg-accent px-4 py-2 font-semibold text-white"
            >
              Study the {missed.length} missed {missed.length === 1 ? "word" : "words"}
            </button>
          )}
          <button
            type="button"
            onClick={() => startOver(cards)}
            className="rounded-lg bg-navy px-4 py-2 font-semibold text-white"
          >
            {cards.length === 1 ? "Study again" : `Study all ${cards.length} again`}
          </button>
          {newSetHref && (
            // A full page load (not <Link>), so the server picks new cards.
            <a
              href={newSetHref}
              className="rounded-lg border border-navy px-4 py-2 font-semibold text-navy"
            >
              New random set
            </a>
          )}
          <Link
            href="/study"
            className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700"
          >
            Pick another lesson
          </Link>
        </div>
      </section>
    );
  }

  const extras = [
    { label: "Pronunciation", value: card.pronunciation },
    { label: "Polite form", value: card.polite_form },
    { label: "Example", value: card.example_sentence },
  ].filter((x) => x.value);

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Card {index + 1} of {deck.length}
        </span>
        <span>
          <span className="text-success">✓ {answers.filter((a) => a.correct).length}</span>
          <span className="ml-3 text-accent">✗ {answers.filter((a) => !a.correct).length}</span>
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full bg-success transition-all"
          style={{ width: `${(index / deck.length) * 100}%` }}
        />
      </div>

      {/* The whole card is a button: tap (or press Space) to flip it. */}
      <button
        type="button"
        onClick={() => setFlipped(true)}
        disabled={flipped}
        aria-label={flipped ? undefined : `${card.korean}. Show the meaning`}
        className="mt-6 flex min-h-72 w-full flex-col items-center justify-center rounded-2xl bg-surface p-8 text-center enabled:cursor-pointer enabled:hover:bg-gray-200/60"
      >
        <span lang="ko" className={`font-bold text-navy ${flipped ? "text-3xl" : "text-6xl"}`}>
          {card.korean}
        </span>
        {flipped ? (
          <span aria-live="polite" className="mt-4 flex flex-col items-center gap-3">
            <span className="text-3xl text-gray-900">{card.english}</span>
            {extras.map((x) => (
              <span key={x.label} className="text-sm text-gray-600">
                {x.label}: <span lang="ko" className="text-base text-gray-800">{x.value}</span>
              </span>
            ))}
          </span>
        ) : (
          <span className="mt-6 text-sm text-gray-500">Tap to see the meaning</span>
        )}
      </button>

      {flipped ? (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => answer(false)}
            className="rounded-xl bg-accent py-4 text-lg font-semibold text-white"
          >
            ✗ Missed it
          </button>
          <button
            type="button"
            onClick={() => answer(true)}
            className="rounded-xl bg-success py-4 text-lg font-semibold text-white"
          >
            ✓ Got it
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setFlipped(true)}
          className="mt-4 w-full rounded-xl bg-navy py-4 text-lg font-semibold text-white"
        >
          Flip
        </button>
      )}
      <p className="mt-3 hidden text-center text-xs text-gray-500 sm:block">
        Keyboard: Space to flip, ← Missed it, → Got it
      </p>

      {savingNote}
    </section>
  );
}
