"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// The fields on the add and edit forms, as typed.
export type CardValues = {
  lesson_id: string;
  korean: string;
  english: string;
  pronunciation: string;
  polite_form: string;
  example_sentence: string;
  notes: string;
};

// The fields a card can't be saved without.
export type RequiredField = "lesson_id" | "korean" | "english";

export type CardState = {
  error?: string;
  // One friendly message per blank required field, shown next to that field.
  fieldErrors?: Partial<Record<RequiredField, string>>;
  values?: CardValues;
};

function readForm(formData: FormData): CardValues {
  const field = (name: string) => String(formData.get(name) ?? "").trim();
  return {
    lesson_id: field("lesson_id"),
    korean: field("korean"),
    english: field("english"),
    pronunciation: field("pronunciation"),
    polite_form: field("polite_form"),
    example_sentence: field("example_sentence"),
    notes: field("notes"),
  };
}

// What gets saved: blank optional fields are stored as empty (null).
function toRow(values: CardValues) {
  return {
    lesson_id: Number(values.lesson_id),
    korean: values.korean,
    english: values.english,
    pronunciation: values.pronunciation || null,
    polite_form: values.polite_form || null,
    example_sentence: values.example_sentence || null,
    notes: values.notes || null,
  };
}

// Checks the required fields. Returns a message for each one that's blank,
// or null if the card is ready to save. Spaces alone count as blank,
// because readForm already trimmed them.
function validate(values: CardValues): CardState["fieldErrors"] | null {
  const errors: CardState["fieldErrors"] = {};
  if (!/^\d+$/.test(values.lesson_id)) errors.lesson_id = "Please choose a lesson.";
  if (!values.korean) errors.korean = "Please add the Korean word.";
  if (!values.english) errors.english = "Please add the English meaning.";
  return Object.keys(errors).length > 0 ? errors : null;
}

export async function createCard(
  _prev: CardState,
  formData: FormData,
): Promise<CardState> {
  const values = readForm(formData);
  const fieldErrors = validate(values);
  if (fieldErrors) return { fieldErrors, values };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cards")
    .insert(toRow(values))
    .select("id")
    .single();

  if (error) return { error: `Couldn't save the word: ${error.message}`, values };

  revalidatePath("/", "layout");
  redirect(`/cards/${data.id}`);
}

// `id` is filled in by the edit page with .bind(), so the form can't change it.
export async function updateCard(
  id: number,
  _prev: CardState,
  formData: FormData,
): Promise<CardState> {
  const values = readForm(formData);
  const fieldErrors = validate(values);
  if (fieldErrors) return { fieldErrors, values };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cards")
    .update(toRow(values))
    .eq("id", id)
    .select("id");

  if (error) return { error: `Couldn't save the word: ${error.message}`, values };
  // Row-level security makes someone else's card look like no rows at all.
  if (data.length === 0) return { error: "Card not found.", values };

  revalidatePath("/", "layout");
  redirect(`/cards/${id}`);
}

export async function deleteCard(id: number): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cards")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) return { error: `Couldn't delete the word: ${error.message}` };
  if (data.length === 0) return { error: "Card not found." };

  revalidatePath("/", "layout");
  redirect("/cards");
}
