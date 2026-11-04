import Link from "next/link";
import { StudySession } from "@/app/study/[deck]/study-session";
import { getCards, getLessons } from "@/lib/data";
import { parseCount, RANDOM_SET_MAX } from "@/lib/random-set";
import { shuffle } from "@/lib/shuffle";

export const metadata = { title: "Study · K-Study" };

// A study session for one lesson (/study/3), my starred words
// (/study/starred), or a random mix from all lessons (/study/random?count=20).
export default async function StudyDeckPage({ params, searchParams }: PageProps<"/study/[deck]">) {
  const { deck } = await params;

  if (deck === "random") {
    const count = parseCount((await searchParams).count);
    if (count === null) {
      return <NothingToStudy message={`Please choose a number of cards from 1 to ${RANDOM_SET_MAX}.`} />;
    }
    // Shuffle all my cards, then keep the first `count`: a random pick
    // that's already in a random order. If I ask for more cards than I
    // have, I just get all of them.
    const cards = shuffle(await getCards()).slice(0, count);
    if (cards.length === 0) return <NothingToStudy message="There are no words to study here yet." />;
    return (
      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-12">
        <Link href="/study" className="text-sm font-semibold text-navy underline">
          ← All lessons
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-navy">
          Random mix · {cards.length} {cards.length === 1 ? "card" : "cards"}
        </h1>
        <StudySession cards={cards} newSetHref={`/study/random?count=${count}`} />
      </main>
    );
  }

  let title: string;
  let cards;
  if (deck === "starred") {
    title = "★ Starred words";
    cards = await getCards({ starredOnly: true });
  } else {
    // Only my own lessons are returned, so someone else's lesson id
    // (or a made-up one) shows "Lesson not found".
    const lesson = /^\d+$/.test(deck)
      ? (await getLessons()).find((l) => l.id === Number(deck))
      : undefined;
    if (!lesson) return <NothingToStudy message="Lesson not found." />;
    title = `Lesson ${lesson.number} · ${lesson.topic_korean}`;
    cards = await getCards({ lessonId: lesson.id });
  }

  if (cards.length === 0) return <NothingToStudy message="There are no words to study here yet." />;

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-12">
      <Link href="/study" className="text-sm font-semibold text-navy underline">
        ← All lessons
      </Link>
      <h1 lang="ko" className="mt-4 text-2xl font-bold text-navy">
        {title}
      </h1>
      <StudySession cards={shuffle(cards)} />
    </main>
  );
}

function NothingToStudy({ message }: { message: string }) {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-12">
      <p className="rounded-xl bg-surface p-6 text-gray-600">
        {message}{" "}
        <Link href="/study" className="font-semibold text-navy underline">
          Pick a lesson to study
        </Link>
        .
      </p>
    </main>
  );
}
