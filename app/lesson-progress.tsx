import Link from "next/link";
import type { LessonMastery, WeakWord } from "@/lib/mastery";

// One lesson's mastery on its home page tile: a progress bar, the count of
// words in each status, and a list of the weakest words to open.
export function LessonProgress({ mastery }: { mastery: LessonMastery }) {
  return (
    <div className="mt-3">
      {/* The numbers below say the same thing, so screen readers skip the bar. */}
      <div className="h-2 overflow-hidden rounded-full bg-gray-200" aria-hidden>
        <div className="h-full bg-success" style={{ width: `${mastery.percent}%` }} />
      </div>
      <p className="mt-2 text-sm text-gray-700">
        {mastery.known} known · {mastery.fading} fading · {mastery.missed} missed · {mastery.new} new{" "}
        <span className="whitespace-nowrap font-semibold">({mastery.percent}% mastered)</span>
      </p>

      {mastery.weakest.length > 0 && (
        <details className="mt-2 text-sm">
          <summary className="cursor-pointer text-gray-600">Weakest words</summary>
          <ul className="mt-2 divide-y divide-gray-200">
            {mastery.weakest.map((word) => (
              <li key={word.id}>
                <Link
                  href={`/cards/${word.id}`}
                  className="flex items-baseline justify-between gap-3 py-1.5 hover:underline"
                >
                  <span className="min-w-0">
                    <span className="font-semibold text-navy">{word.korean}</span>{" "}
                    <span className="text-gray-600">{word.english}</span>
                  </span>
                  <WeakLabel word={word} />
                </Link>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

function WeakLabel({ word }: { word: WeakWord }) {
  if (word.status === "fading") {
    return <span className="shrink-0 text-xs text-gray-500">Fading</span>;
  }
  return (
    <span className="shrink-0 text-xs font-semibold text-accent">
      Missed{word.timesMissed > 1 ? ` ${word.timesMissed} times` : ""}
    </span>
  );
}
