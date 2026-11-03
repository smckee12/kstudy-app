import Link from "next/link";
import { deleteCard } from "@/app/actions/cards";
import { CardNotFound } from "@/app/cards/[id]/card-not-found";
import { DeleteButton } from "@/app/cards/[id]/delete-button";
import { StarButton } from "@/app/cards/star-button";
import { getCard } from "@/lib/data";

export const metadata = { title: "Word · K-Study" };

// One word's detail page.
export default async function CardPage({ params }: PageProps<"/cards/[id]">) {
  const { id } = await params;
  const card = await getCard(id);
  if (!card) return <CardNotFound />;

  const { lesson } = card;
  const details = [
    { label: "Pronunciation", value: card.pronunciation, ko: true },
    { label: "Polite form", value: card.polite_form, ko: true },
    { label: "Example sentence", value: card.example_sentence, ko: true },
    { label: "Notes", value: card.notes, ko: false },
  ].filter((detail) => detail.value);

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-12">
      <Link href="/cards" className="text-sm font-semibold text-navy underline">
        ← My words
      </Link>

      <div className="mt-4 rounded-2xl bg-surface p-8">
        <p className="text-sm font-semibold text-gray-500">
          Lesson {lesson.number} · {lesson.topic_korean}
          {lesson.topic_english && ` (${lesson.topic_english})`}
        </p>
        <div className="mt-2 flex items-start justify-between gap-4">
          <h1 lang="ko" className="text-5xl font-bold text-navy">
            {card.korean}
          </h1>
          <StarButton cardId={card.id} starred={card.starred} size="lg" />
        </div>
        <p className="mt-3 text-2xl text-gray-800">{card.english}</p>

        {details.length > 0 && (
          <dl className="mt-6 flex flex-col gap-3 border-t border-gray-200 pt-6">
            {details.map((detail) => (
              <div key={detail.label}>
                <dt className="text-sm font-semibold text-gray-500">{detail.label}</dt>
                <dd lang={detail.ko ? "ko" : undefined} className="mt-0.5 whitespace-pre-line text-lg">
                  {detail.value}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-start gap-3">
        <Link
          href={`/cards/${card.id}/edit`}
          className="rounded-lg bg-navy px-4 py-2 font-semibold text-white"
        >
          Edit
        </Link>
        <DeleteButton action={deleteCard.bind(null, card.id)} />
      </div>
    </main>
  );
}
