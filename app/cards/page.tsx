import Link from "next/link";
import { CardFiltersBar } from "@/app/cards/card-filters";
import { CardList } from "@/app/cards/card-list";
import { isFiltering, parseFilters } from "@/lib/card-filters";
import { getCards, getLessons } from "@/lib/data";

export const metadata = { title: "My words · K-Study" };

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// Every word the logged-in user has saved. The search, lesson, starred and
// sort choices come from the URL, and the database does the filtering.
export default async function CardsPage({ searchParams }: Props) {
  const filters = parseFilters(await searchParams);
  const [cards, lessons] = await Promise.all([getCards(filters), getLessons()]);
  const total = lessons.reduce((sum, lesson) => sum + lesson.card_count, 0);
  const filtering = isFiltering(filters);

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
      <p className="mt-2 text-gray-600" aria-live="polite">
        {filtering
          ? `${cards.length} of ${total} ${total === 1 ? "word" : "words"}`
          : `${total} ${total === 1 ? "word" : "words"}`}
      </p>

      {total === 0 ? (
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
        <>
          <CardFiltersBar filters={filters} lessons={lessons} />
          {cards.length === 0 ? (
            <p className="mt-6 rounded-xl bg-surface p-6 text-gray-600">
              No words match.{" "}
              <Link href="/cards" className="font-semibold text-navy underline">
                Clear the search and filters
              </Link>
              .
            </p>
          ) : (
            <CardList cards={cards} />
          )}
        </>
      )}
    </main>
  );
}
