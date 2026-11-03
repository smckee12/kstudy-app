// The rules for a card, shared by the add/edit forms and the CSV import,
// so a word is checked the same way however it gets into the app.

// A card's fields as typed, before saving.
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

export type FieldErrors = Partial<Record<RequiredField, string>>;

// Checks the required fields. Returns a message for each one that's blank,
// or null if the card is ready to save. Values should already be trimmed,
// so spaces alone count as blank.
export function validateCard(values: CardValues): FieldErrors | null {
  const errors: FieldErrors = {};
  if (!/^\d+$/.test(values.lesson_id)) errors.lesson_id = "Please choose a lesson.";
  if (!values.korean) errors.korean = "Please add the Korean word.";
  if (!values.english) errors.english = "Please add the English meaning.";
  return Object.keys(errors).length > 0 ? errors : null;
}

// What gets saved: blank optional fields are stored as empty (null).
export function toCardRow(values: CardValues) {
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
