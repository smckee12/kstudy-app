import Link from "next/link";
import { StarButton } from "@/app/cards/star-button";
import type { CardWithLesson } from "@/lib/data";

// The list of words on My words and Starred. The star sits outside the
// link, so clicking it stars the word instead of opening it.
export function CardList({ cards }: { cards: CardWithLesson[] }) {
  return (
    <ul className="mt-6 flex flex-col gap-2">
      {cards.map((card) => (
        <li key={card.id} className="flex items-center gap-3 rounded-xl bg-surface pl-4 hover:bg-gray-200/60">
          <StarButton cardId={card.id} starred={card.starred} />
          <Link
            href={`/cards/${card.id}`}
            className="flex flex-1 items-center justify-between gap-4 py-4 pr-5"
          >
            <span>
              <span lang="ko" className="text-xl font-bold text-navy">
                {card.korean}
              </span>
              <span className="ml-3 text-gray-700">{card.english}</span>
            </span>
            <span className="shrink-0 text-sm text-gray-500">Lesson {card.lesson.number}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
