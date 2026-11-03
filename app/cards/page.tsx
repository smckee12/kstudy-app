import Link from "next/link";
import { CardList } from "@/app/cards/card-list";
import { getCards } from "@/lib/data";

export const metadata = { title: "My words · K-Study" };

// Every word the logged-in user has saved, newest first.
export default async function CardsPage() {
  const cards = await getCards();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-navy">My words</h1>
        <div className="flex gap-2">
          <Link
            href="/cards/import"
            className="rounded-lg border border-navy px-4 py-2 font-semibold text-navy"
          >
            Import CSV
          </Link>
          <Link
            href="/cards/new"
            className="rounded-lg bg-navy px-4 py-2 font-semibold text-white"
          >
            + Add a word
          </Link>
        </div>
      </div>
      <p className="mt-2 text-gray-600">
        {cards.length} {cards.length === 1 ? "word" : "words"}
      </p>

      {cards.length === 0 ? (
        <p className="mt-6 rounded-xl bg-surface p-6 text-gray-600">
          You haven&apos;t added any words yet.{" "}
          <Link href="/cards/new" className="font-semibold text-navy underline">
            Add your first word
          </Link>{" "}
          or{" "}
          <Link href="/cards/import" className="font-semibold text-navy underline">
            import your spreadsheet
          </Link>
          .
        </p>
      ) : (
        <CardList cards={cards} />
      )}
    </main>
  );
}
