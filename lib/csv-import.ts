import Papa from "papaparse";
import { validateCard, type CardValues } from "@/lib/card-rules";

// Reads a vocab CSV (the "Vocab Bank" sheet saved as CSV) into cards.
// Used twice: in the browser for the preview, and again on the server
// before saving, so the server never trusts what the browser sent.

type LessonRef = { id: number; number: number; topic_korean: string };

export type CsvProblem = { row: number; message: string };

export type CsvResult = {
  cards: CardValues[];
  problems: CsvProblem[];
  // Required columns the file doesn't have, e.g. ["English meaning"].
  missingColumns: string[];
};

// Which card field each spreadsheet column fills. Column names are matched
// ignoring capitals and extra spaces. The Topic column isn't saved (lessons
// already have their topic), but it's used to double-check the lesson number.
const COLUMNS: Record<string, keyof CardValues> = {
  lesson: "lesson_id",
  korean: "korean",
  english: "english",
  "english meaning": "english",
  pronunciation: "pronunciation",
  "polite form": "polite_form",
  "example sentence": "example_sentence",
  notes: "notes",
};

const REQUIRED_COLUMNS: [keyof CardValues, string][] = [
  ["lesson_id", "Lesson"],
  ["korean", "Korean"],
  ["english", "English meaning"],
];

const normalize = (header: string) => header.trim().toLowerCase().replace(/\s+/g, " ");

export function parseVocabCsv(text: string, lessons: LessonRef[]): CsvResult {
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    transformHeader: normalize,
  });

  const headers = parsed.meta.fields ?? [];
  const found = new Set(headers.map((header) => COLUMNS[header]).filter(Boolean));
  const missingColumns = REQUIRED_COLUMNS.filter(([field]) => !found.has(field)).map(
    ([, name]) => name,
  );
  if (missingColumns.length > 0) return { cards: [], problems: [], missingColumns };

  const lessonsByNumber = new Map(lessons.map((lesson) => [lesson.number, lesson]));
  const cards: CardValues[] = [];
  const problems: CsvProblem[] = [];

  parsed.data.forEach((raw, index) => {
    // Row 1 in the spreadsheet is the header, so data starts on row 2.
    const row = index + 2;

    const values: CardValues = {
      lesson_id: "",
      korean: "",
      english: "",
      pronunciation: "",
      polite_form: "",
      example_sentence: "",
      notes: "",
    };
    for (const [header, cell] of Object.entries(raw)) {
      const field = COLUMNS[header];
      if (field && !values[field]) values[field] = String(cell ?? "").trim();
    }
    // Skip blank lines, like the empty rows at the end of a spreadsheet.
    if (Object.values(values).every((value) => !value)) return;

    // The file says "Lesson 2" (or just "2"); the database needs that lesson's id.
    const lessonNumber = values.lesson_id.match(/^(?:lesson\s*)?(\d+)$/i)?.[1];
    if (!values.lesson_id) {
      problems.push({ row, message: "The Lesson column is blank." });
      return;
    }
    const lesson = lessonNumber ? lessonsByNumber.get(Number(lessonNumber)) : undefined;
    if (!lesson) {
      problems.push({
        row,
        message: `There's no Lesson ${lessonNumber ?? `"${values.lesson_id}"`} in your lessons.`,
      });
      return;
    }
    // Catches a wrong lesson number, e.g. when dragging a cell in Excel
    // counted up 4, 5, 6 instead of copying 4. Topic looks like "인사 (Greetings)".
    const topic = String(raw.topic ?? "").trim();
    if (topic && !topic.startsWith(lesson.topic_korean)) {
      problems.push({
        row,
        message: `The topic "${topic}" doesn't match Lesson ${lesson.number} (${lesson.topic_korean}). Check the lesson number.`,
      });
      return;
    }
    values.lesson_id = String(lesson.id);

    const errors = validateCard(values);
    if (errors) {
      problems.push({ row, message: Object.values(errors).join(" ") });
      return;
    }
    cards.push(values);
  });

  return { cards, problems, missingColumns };
}

// Two cards count as the same word if they have the same lesson, Korean and
// English. (개 = dog and 개 = counter for items are different words.)
export function cardKey(card: { lesson_id: string | number; korean: string; english: string }) {
  return `${card.lesson_id}|${card.korean}|${card.english}`;
}
