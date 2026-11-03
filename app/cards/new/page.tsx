import { createCard } from "@/app/actions/cards";
import { CardForm } from "@/app/cards/card-form";
import { getLessons } from "@/lib/data";

export const metadata = { title: "Add a word · K-Study" };

export default async function NewCardPage() {
  const lessons = await getLessons();

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-12">
      <h1 className="text-3xl font-bold text-navy">Add a word</h1>
      <CardForm
        action={createCard}
        lessons={lessons}
        submitLabel="Save word"
        cancelHref="/cards"
      />
    </main>
  );
}
