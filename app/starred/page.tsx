import Link from "next/link";
import { CardList } from "@/app/cards/card-list";
import { getCards } from "@/lib/data";

export const metadata = { title: "Starred · K-Study" };

// Only the words I've starred: my problem words to drill before a quiz.
export default async function StarredPage() {
  const cards = await getCards({ starredOnly: true });

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
      <h1 className="text-3xl font-bold text-navy">
        <span className="text-accent">★</span> Starred
      </h1>
      <p className="mt-2 text-gray-600">
        {cards.length} {cards.length === 1 ? "word" : "words"} to practice
      </p>

      {cards.length === 0 ? (
        <p className="mt-6 rounded-xl bg-surface p-6 text-gray-600">
          No starred words yet. Tap the ☆ next to a word you keep forgetting, in{" "}
          <Link href="/cards" className="font-semibold text-navy underline">
            My words
          </Link>{" "}
          or on the word&apos;s page.
        </p>
      ) : (
        <CardList cards={cards} />
      )}
    </main>
  );
}
