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
  starred: boolean;
};

// Each card comes with its lesson and, if I starred it, my star.
// Row-level security means only my own stars are ever returned.
const CARD_COLUMNS = "*, lesson:lessons(number, topic_korean, topic_english)";

type CardRow = Omit<CardWithLesson, "starred"> & { stars: { card_id: number }[] };

const withStarred = ({ stars, ...card }: CardRow): CardWithLesson => ({
  ...card,
  starred: stars.length > 0,
});

// The logged-in user's cards, newest first. With `starredOnly`, just the
// starred ones: "stars!inner" keeps only cards that have a matching star.
export async function getCards({ starredOnly = false } = {}): Promise<CardWithLesson[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cards")
    .select(`${CARD_COLUMNS}, stars${starredOnly ? "!inner" : ""}(card_id)`)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Couldn't load cards: ${error.message}`);
  return (data as CardRow[]).map(withStarred);
}

// One card by id, or null if it doesn't exist or belongs to someone else.
// Row-level security hides other users' cards, so they look "not found".
export async function getCard(id: string): Promise<CardWithLesson | null> {
  if (!/^\d+$/.test(id)) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cards")
    .select(`${CARD_COLUMNS}, stars(card_id)`)
    .eq("id", Number(id))
    .maybeSingle();

  if (error) throw new Error(`Couldn't load card: ${error.message}`);
  return data ? withStarred(data as CardRow) : null;
}
