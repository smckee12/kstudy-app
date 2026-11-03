"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { importCards, type ImportState } from "@/app/actions/import";
import { parseVocabCsv, type CsvResult } from "@/lib/csv-import";
import type { Lesson } from "@/lib/types";

type Props = {
  lessons: Pick<Lesson, "id" | "number" | "topic_korean" | "topic_english">[];
};

// Big enough for thousands of words, small enough for a Server Action.
const MAX_BYTES = 1_000_000;

const ENCODING_HELP =
  "This file isn't saved as UTF-8, so the Korean would come out garbled. In Excel, choose File → Save As, set the format to “CSV UTF-8 (Comma delimited)”, and upload that file.";

type Preview = { fileName: string; text: string; result: CsvResult };

export function ImportForm({ lessons }: Props) {
  const [preview, setPreview] = useState<Preview | null>(null);
  const [readError, setReadError] = useState<string>();
  // Changing the key clears the file picker after an import.
  const [inputKey, setInputKey] = useState(0);

  const [state, formAction, pending] = useActionState(
    async (prev: ImportState, formData: FormData) => {
      const result = await importCards(prev, formData);
      if (!result.error) {
        setPreview(null);
        setInputKey((key) => key + 1);
      }
      return result;
    },
    {},
  );

  async function handleFile(file: File | undefined) {
    setPreview(null);
    setReadError(undefined);
    if (!file) return;
    if (file.size > MAX_BYTES) {
      setReadError("That file is too big. Please upload a CSV under 1 MB.");
      return;
    }

    // Read the raw bytes and insist they're valid UTF-8. Excel's plain "CSV"
    // format saves Korean in an older encoding that would turn into gibberish.
    let text: string;
    try {
      text = new TextDecoder("utf-8", { fatal: true }).decode(await file.arrayBuffer());
    } catch {
      setReadError(ENCODING_HELP);
      return;
    }
    if (text.includes("�")) {
      setReadError(ENCODING_HELP);
      return;
    }

    setPreview({ fileName: file.name, text, result: parseVocabCsv(text, lessons) });
  }

  const result = preview?.result;
  const countByLesson = new Map<string, number>();
  result?.cards.forEach((card) =>
    countByLesson.set(card.lesson_id, (countByLesson.get(card.lesson_id) ?? 0) + 1),
  );

  return (
    <div className="mt-6 flex flex-col gap-6">
      {state.imported !== undefined && !state.error && (
        <div role="status" className="rounded-lg bg-green-50 px-4 py-3 text-success">
          <p className="font-semibold">
            Imported {state.imported} {state.imported === 1 ? "word" : "words"}.
          </p>
          {state.duplicates ? (
            <p className="mt-1 text-sm">
              Skipped {state.duplicates} {state.duplicates === 1 ? "word that was" : "words that were"}{" "}
              already in your word bank.
            </p>
          ) : null}
          <Link href="/cards" className="mt-2 inline-block text-sm font-semibold underline">
            See my words
          </Link>
        </div>
      )}

      <label className="flex flex-col gap-2 text-sm font-medium">
        CSV file
        <input
          key={inputKey}
          type="file"
          accept=".csv,text/csv"
          onChange={(event) => handleFile(event.target.files?.[0])}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-base font-normal file:mr-3 file:rounded-md file:border-0 file:bg-surface file:px-3 file:py-1 file:font-semibold file:text-navy"
        />
      </label>

      {readError && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-accent">
          {readError}
        </p>
      )}

      {result && result.missingColumns.length > 0 && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-accent">
          This file is missing {result.missingColumns.length === 1 ? "a column" : "columns"}:{" "}
          <strong>{result.missingColumns.join(", ")}</strong>. The first row needs the
          column names, like the Vocab Bank sheet.
        </p>
      )}

      {preview && result && result.missingColumns.length === 0 && (
        <section className="rounded-xl bg-surface p-5">
          <h2 className="font-bold text-navy">
            {result.cards.length} {result.cards.length === 1 ? "word" : "words"} ready to import
            from {preview.fileName}
          </h2>
          <ul className="mt-3 flex flex-col gap-1 text-sm text-gray-700">
            {lessons
              .filter((lesson) => countByLesson.has(String(lesson.id)))
              .map((lesson) => (
                <li key={lesson.id}>
                  Lesson {lesson.number} · {lesson.topic_korean}:{" "}
                  {countByLesson.get(String(lesson.id))}{" "}
                  {countByLesson.get(String(lesson.id)) === 1 ? "word" : "words"}
                </li>
              ))}
          </ul>

          {result.problems.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-accent">
                {result.problems.length} {result.problems.length === 1 ? "row" : "rows"} will be
                skipped:
              </p>
              <ul className="mt-1 max-h-48 overflow-y-auto text-sm text-gray-700">
                {result.problems.map((problem) => (
                  <li key={problem.row}>
                    Row {problem.row}: {problem.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="mt-4 text-xs text-gray-500">
            Words already in your word bank are skipped, so importing the same file twice is safe.
          </p>

          <form action={formAction} className="mt-4">
            <input type="hidden" name="csv" value={preview.text} />
            <button
              type="submit"
              disabled={pending || result.cards.length === 0}
              className="rounded-lg bg-navy px-4 py-2 font-semibold text-white disabled:opacity-60"
            >
              {pending
                ? "Importing…"
                : `Import ${result.cards.length} ${result.cards.length === 1 ? "word" : "words"}`}
            </button>
          </form>
        </section>
      )}

      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-accent">
          {state.error}
        </p>
      )}
    </div>
  );
}
