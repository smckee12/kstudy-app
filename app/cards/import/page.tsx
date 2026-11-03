import Link from "next/link";
import { ImportForm } from "@/app/cards/import/import-form";
import { getLessons } from "@/lib/data";

export const metadata = { title: "Import words · K-Study" };

export default async function ImportPage() {
  const lessons = await getLessons();

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-12">
      <Link href="/cards" className="text-sm font-semibold text-navy underline">
        ← My words
      </Link>
      <h1 className="mt-4 text-3xl font-bold text-navy">Import words from a CSV</h1>
      <div className="mt-3 flex flex-col gap-2 text-gray-700">
        <p>
          In Excel, open the <strong>Vocab Bank</strong> sheet and choose{" "}
          <strong>File → Save As</strong>, with the format set to{" "}
          <strong>CSV UTF-8 (Comma delimited)</strong>.
        </p>
        <p className="text-sm text-gray-600">
          The first row needs these columns: Lesson, Korean, English meaning. Pronunciation,
          Polite form, Example sentence and Notes are optional. If there&apos;s a Topic column,
          it&apos;s used to double-check each row&apos;s lesson number.
        </p>
      </div>
      <ImportForm lessons={lessons} />
    </main>
  );
}
