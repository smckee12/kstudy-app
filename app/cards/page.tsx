import Link from "next/link";
import { getCards } from "@/lib/data";

export const metadata = { title: "My words · K-Study" };

// Every word the logged-in user has saved, newest first.
export default async function CardsPage() {
  const cards = await getCards();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-navy">My words</h1>
        <Link
          href="/cards/new"
          className="rounded-lg bg-navy px-4 py-2 font-semibold text-white"
        >
          + Add a word
        </Link>
      </div>
      <p className="mt-2 text-gray-600">
        {cards.length} {cards.length === 1 ? "word" : "words"}
      </p>

      {cards.length === 0 ? (
        <p className="mt-6 rounded-xl bg-surface p-6 text-gray-600">
          You haven&apos;t added any words yet.{" "}
          <Link href="/cards/new" className="font-semibold text-navy underline">
            Add your first word
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-2">
          {cards.map((card) => (
            <li key={card.id}>
              <Link
                href={`/cards/${card.id}`}
                className="flex items-center justify-between gap-4 rounded-xl bg-surface px-5 py-4 hover:bg-gray-200/60"
              >
                <span>
                  <span lang="ko" className="text-xl font-bold text-navy">
                    {card.korean}
                  </span>
                  <span className="ml-3 text-gray-700">{card.english}</span>
                </span>
                <span className="shrink-0 text-sm text-gray-500">
                  Lesson {card.lesson.number}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
