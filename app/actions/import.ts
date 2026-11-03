"use server";

import { revalidatePath } from "next/cache";
import { toCardRow } from "@/lib/card-rules";
import { cardKey, parseVocabCsv } from "@/lib/csv-import";
import { getCards, getLessons } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

export type ImportState = {
  error?: string;
  imported?: number;
  // Words skipped because they're already in the word bank (or twice in the file).
  duplicates?: number;
};

// Saves every valid row of the uploaded CSV as a card.
// The browser already showed a preview, but the file is checked again here.
export async function importCards(
  _prev: ImportState,
  formData: FormData,
): Promise<ImportState> {
  const text = String(formData.get("csv") ?? "");
  if (!text.trim()) return { error: "Please choose a CSV file first." };

  const [lessons, existing] = await Promise.all([getLessons(), getCards()]);
  const { cards, missingColumns } = parseVocabCsv(text, lessons);
  if (missingColumns.length > 0) {
    return { error: `The file is missing these columns: ${missingColumns.join(", ")}.` };
  }

  // Leave out words that are already saved, so importing twice is safe.
  const seen = new Set(existing.map(cardKey));
  const newCards = cards.filter((card) => {
    const key = cardKey(card);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const duplicates = cards.length - newCards.length;

  if (newCards.length > 0) {
    const supabase = await createClient();
    const { error } = await supabase.from("cards").insert(newCards.map(toCardRow));
    // One insert for all rows: if anything fails, nothing is saved, so a
    // half-imported file can't happen.
    if (error) return { error: `Couldn't import the words: ${error.message}` };
  }

  revalidatePath("/", "layout");
  return { imported: newCards.length, duplicates };
}
