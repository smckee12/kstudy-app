import Link from "next/link";
import type { LessonMastery, ListedWord } from "@/lib/mastery";

// One lesson's mastery on its home page tile: a progress bar, the count of
// words in each status, and the words to review, weakest first.
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

      {(mastery.weakest.length > 0 || mastery.fadingWords.length > 0) && (
        <details className="mt-2 text-sm">
          <summary className="cursor-pointer text-gray-600">Words to review</summary>
          <WordList title="Weakest" hint="missed the most" words={mastery.weakest} showMisses />
          <WordList title="Fading" hint="not tested in a while" words={mastery.fadingWords} />
        </details>
      )}
    </div>
  );
}

function WordList({
  title,
  hint,
  words,
  showMisses = false,
}: {
  title: string;
  hint: string;
  words: ListedWord[];
  showMisses?: boolean;
}) {
  if (words.length === 0) return null;
  return (
    <div className="mt-3">
      <h4 className="font-semibold text-gray-700">
        {title} <span className="font-normal text-gray-500">· {hint}</span>
      </h4>
      <ul className="mt-1 divide-y divide-gray-200">
        {words.map((word) => (
          <li key={word.id}>
            <Link
              href={`/cards/${word.id}`}
              className="flex items-baseline justify-between gap-3 py-1.5 hover:underline"
            >
              <span className="min-w-0">
                <span className="font-semibold text-navy">{word.korean}</span>{" "}
                <span className="text-gray-600">{word.english}</span>
              </span>
              {showMisses && (
                <span className="shrink-0 text-xs font-semibold text-accent">
                  Missed {word.timesMissed === 1 ? "once" : `${word.timesMissed} times`}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
