import { updateCard } from "@/app/actions/cards";
import { CardForm } from "@/app/cards/card-form";
import { CardNotFound } from "@/app/cards/[id]/card-not-found";
import { getCard, getLessons } from "@/lib/data";

export const metadata = { title: "Edit word · K-Study" };

export default async function EditCardPage({ params }: PageProps<"/cards/[id]/edit">) {
  const { id } = await params;
  const [card, lessons] = await Promise.all([getCard(id), getLessons()]);
  if (!card) return <CardNotFound />;

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-12">
      <h1 className="text-3xl font-bold text-navy">Edit word</h1>
      <CardForm
        action={updateCard.bind(null, card.id)}
        lessons={lessons}
        initial={{
          lesson_id: String(card.lesson_id),
          korean: card.korean,
          english: card.english,
          pronunciation: card.pronunciation ?? "",
          polite_form: card.polite_form ?? "",
          example_sentence: card.example_sentence ?? "",
          notes: card.notes ?? "",
        }}
        submitLabel="Save changes"
        cancelHref={`/cards/${card.id}`}
      />
    </main>
  );
}
