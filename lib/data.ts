import "server-only";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import type { Card, Lesson } from "@/lib/types";

export type LessonWithCount = Lesson & { card_count: number };

// The logged-in user's lessons in textbook order, with how many cards each has.
export async function getLessons(): Promise<LessonWithCount[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lessons")
    .select("*, cards(count)")
    .eq("user_id", user.id)
    .order("number");

  if (error) throw new Error(`Couldn't load lessons: ${error.message}`);

  return data.map(({ cards, ...lesson }) => ({
    ...lesson,
    card_count: cards[0]?.count ?? 0,
  }));
}

export type CardWithLesson = Card & {
  lesson: Pick<Lesson, "number" | "topic_korean" | "topic_english">;
};

// All of the logged-in user's cards, newest first, with each card's lesson.
export async function getCards(): Promise<CardWithLesson[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cards")
    .select("*, lesson:lessons(number, topic_korean, topic_english)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Couldn't load cards: ${error.message}`);
  return data as CardWithLesson[];
}

// One card by id, or null if it doesn't exist or belongs to someone else.
// Row-level security hides other users' cards, so they look "not found".
export async function getCard(id: string): Promise<CardWithLesson | null> {
  if (!/^\d+$/.test(id)) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cards")
    .select("*, lesson:lessons(number, topic_korean, topic_english)")
    .eq("id", Number(id))
    .maybeSingle();

  if (error) throw new Error(`Couldn't load card: ${error.message}`);
  return data as CardWithLesson | null;
}
