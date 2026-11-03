// Row shapes for the tables in supabase/migrations.

export type Lesson = {
  id: number;
  user_id: string;
  number: number;
  topic_korean: string;
  topic_english: string | null;
  created_at: string;
};

export type Card = {
  id: number;
  lesson_id: number;
  user_id: string;
  korean: string;
  pronunciation: string | null;
  polite_form: string | null;
  english: string;
  example_sentence: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};
