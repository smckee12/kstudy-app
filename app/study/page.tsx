import Form from "next/form";
import Link from "next/link";
import { getCards, getLessons } from "@/lib/data";
import { RANDOM_SET_DEFAULT, RANDOM_SET_MAX } from "@/lib/random-set";

export const metadata = { title: "Study · K-Study" };

// Pick what to study: one lesson, or my starred words.
export default async function StudyPage() {
  const [lessons, starred] = await Promise.all([getLessons(), getCards({ starredOnly: true })]);
  const studyable = lessons.filter((lesson) => lesson.card_count > 0);
  const total = lessons.reduce((sum, lesson) => sum + lesson.card_count, 0);
  // Can't ask for more cards than I have (only matters with under 50 words).
  const maxCount = Math.min(RANDOM_SET_MAX, total);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
      <h1 className="text-3xl font-bold text-navy">Study</h1>
      <p className="mt-2 text-gray-600">
        Pick a lesson. You&apos;ll see the Korean, tap to flip, then say whether you got it.
      </p>

      {studyable.length === 0 ? (
        <p className="mt-6 rounded-xl bg-surface p-6 text-gray-600">
          You don&apos;t have any words to study yet.{" "}
          <Link href="/cards/new" className="font-semibold text-navy underline">
            Add a word
          </Link>{" "}
          or{" "}
          <Link href="/cards/import" className="font-semibold text-navy underline">
            import your spreadsheet
          </Link>
          .
        </p>
      ) : (
        <>
        {/* A plain GET form: submitting goes to /study/random?count=20.
            min/max/required make the browser check the number first. */}
        <Form action="/study/random" className="mt-6 rounded-xl border-2 border-navy/15 p-5">
          <h2 className="font-bold text-navy">Random mix from all lessons</h2>
          <p className="mt-1 text-sm text-gray-600">
            Cards picked at random from every lesson, in a shuffled order.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2">
              <input
                type="number"
                name="count"
                min={1}
                max={maxCount}
                step={1}
                required
                defaultValue={Math.min(RANDOM_SET_DEFAULT, maxCount)}
                inputMode="numeric"
                aria-describedby="count-hint"
                className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-lg focus:border-navy focus:outline-none"
              />
              <span>cards</span>
            </label>
            <button type="submit" className="rounded-lg bg-navy px-4 py-2.5 font-semibold text-white">
              Start
            </button>
            <span id="count-hint" className="text-sm text-gray-500">
              1 to {maxCount}
            </span>
          </div>
        </Form>

        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {studyable.map((lesson) => (
            <li key={lesson.id}>
              <DeckLink
                href={`/study/${lesson.id}`}
                eyebrow={`Lesson ${lesson.number}`}
                title={lesson.topic_korean}
                subtitle={lesson.topic_english}
                count={lesson.card_count}
              />
            </li>
          ))}
          {starred.length > 0 && (
            <li>
              <DeckLink
                href="/study/starred"
                eyebrow="★ Starred"
                title="My problem words"
                subtitle={null}
                count={starred.length}
              />
            </li>
          )}
        </ul>
        </>
      )}
    </main>
  );
}

function DeckLink(props: {
  href: string;
  eyebrow: string;
  title: string;
  subtitle: string | null;
  count: number;
}) {
  return (
    <Link
      href={props.href}
      className="block rounded-xl bg-surface p-5 hover:bg-gray-200/60"
    >
      <p className="text-sm font-semibold text-gray-500">{props.eyebrow}</p>
      <p className="mt-1 text-lg font-bold text-navy">
        <span lang="ko">{props.title}</span>
        {props.subtitle && (
          <span className="ml-2 text-base font-normal text-gray-600">{props.subtitle}</span>
        )}
      </p>
      <p className="mt-2 text-sm text-gray-600">
        {props.count} {props.count === 1 ? "word" : "words"} · <span className="font-semibold text-navy">Study →</span>
      </p>
    </Link>
  );
}
