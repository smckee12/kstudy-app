import "server-only";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import type { Lesson } from "@/lib/types";

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
