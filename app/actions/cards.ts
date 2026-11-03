"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  toCardRow,
  validateCard,
  type CardValues,
  type FieldErrors,
} from "@/lib/card-rules";
import { createClient } from "@/lib/supabase/server";

export type CardState = {
  error?: string;
  // One friendly message per blank required field, shown next to that field.
  fieldErrors?: FieldErrors;
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

export async function createCard(
  _prev: CardState,
  formData: FormData,
): Promise<CardState> {
  const values = readForm(formData);
  const fieldErrors = validateCard(values);
  if (fieldErrors) return { fieldErrors, values };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cards")
    .insert(toCardRow(values))
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
  const fieldErrors = validateCard(values);
  if (fieldErrors) return { fieldErrors, values };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cards")
    .update(toCardRow(values))
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
