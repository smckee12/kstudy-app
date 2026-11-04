import Link from "next/link";
import { redirect } from "next/navigation";
import { Dashboard } from "@/app/dashboard";
import { getDashboardData, getLessons } from "@/lib/data";
import { getCurrentUser } from "@/lib/supabase/server";

// Home page. Only logged-in users get here (see proxy.ts).
export default async function Home() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [lessons, dashboard] = await Promise.all([getLessons(), getDashboardData()]);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
      <h1 className="text-3xl font-bold text-navy">안녕하세요!</h1>
      <p className="mt-2 text-gray-700">
        You&apos;re logged in as <strong>{user.email}</strong>.
      </p>

      <Dashboard data={dashboard} />

      <div className="mt-10 flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-navy">Your lessons</h2>
        <Link href="/cards" className="text-sm font-semibold text-navy underline">
          See all my words
        </Link>
      </div>

      {lessons.length === 0 ? (
        <p className="mt-4 rounded-xl bg-surface p-6 text-gray-600">
          You don&apos;t have any lessons yet. Once you add words, they&apos;ll
          be grouped by lesson here.
        </p>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {lessons.map((lesson) => (
            <li key={lesson.id} className="rounded-xl bg-surface p-5">
              <p className="text-sm font-semibold text-gray-500">
                Lesson {lesson.number}
              </p>
              <p className="mt-1 text-lg font-bold text-navy">
                {lesson.topic_korean}
                {lesson.topic_english && (
                  <span className="ml-2 text-base font-normal text-gray-600">
                    {lesson.topic_english}
                  </span>
                )}
              </p>
              <p className="mt-2 flex items-center justify-between text-sm text-gray-600">
                {lesson.card_count} {lesson.card_count === 1 ? "word" : "words"}
                {lesson.card_count > 0 && (
                  <Link href={`/study/${lesson.id}`} className="font-semibold text-navy underline">
                    Study →
                  </Link>
                )}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
