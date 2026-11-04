import "server-only";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import type { CardFilters } from "@/lib/card-filters";
import type { ReviewTime } from "@/lib/dashboard";
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

// Builds the "Korean or English contains ___" filter. The search text is
// escaped twice so that symbols in it are matched as plain text:
//   1. % _ \ would otherwise be wildcards in an ilike pattern.
//   2. The value goes in "double quotes" so commas and brackets, as in
//      "counter (for items)", don't break Supabase's or=(...) syntax.
function koreanOrEnglishContains(search: string) {
  const pattern = `%${search.replace(/[\\%_]/g, "\\$&")}%`;
  const quoted = `"${pattern.replace(/[\\"]/g, "\\$&")}"`;
  return `korean.ilike.${quoted},english.ilike.${quoted}`;
}

// The logged-in user's cards, filtered and sorted (newest first by default).
// With `starredOnly`, just the starred ones: "stars!inner" keeps only cards
// that have a matching star.
export async function getCards(filters: Partial<CardFilters> = {}): Promise<CardWithLesson[]> {
  const { search = "", lessonId = null, starredOnly = false, sort = "newest" } = filters;
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = await createClient();
  let query = supabase
    .from("cards")
    .select(`${CARD_COLUMNS}, stars${starredOnly ? "!inner" : ""}(card_id)`)
    .eq("user_id", user.id);

  if (search) query = query.or(koreanOrEnglishContains(search));
  if (lessonId !== null) query = query.eq("lesson_id", lessonId);

  // Hangul is stored in 가나다 order in Unicode, so sorting the Korean
  // column alphabetically gives dictionary order. "By lesson" sorts by the
  // lesson's number, then 가나다 inside each lesson.
  if (sort === "korean") {
    query = query.order("korean");
  } else if (sort === "lesson") {
    query = query.order("lesson(number)").order("korean");
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query.order("id");
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

export type DashboardData = {
  wordCount: number;
  reviewCount: number;
  correctCount: number;
  // My answers from roughly the last 15 days (just the time and whether it
  // was right), for "this week" and the chart. The browser sorts them into
  // days in my own time zone.
  recent: ReviewTime[];
};

// Everything the dashboard needs. Nothing is stored for it: it's all
// counted from cards and reviews each time (PLAN.md section 3).
export async function getDashboardData(): Promise<DashboardData> {
  const user = await getCurrentUser();
  if (!user) return { wordCount: 0, reviewCount: 0, correctCount: 0, recent: [] };

  const supabase = await createClient();
  // 15 days, not 14: one spare day covers the gap between UTC and my time zone.
  const since = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString();

  // `head: true` asks the database for just the count, not the rows.
  const [words, reviews, correct, recent] = await Promise.all([
    supabase.from("cards").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("reviews").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("correct", true),
    supabase
      .from("reviews")
      .select("reviewed_at, correct")
      .eq("user_id", user.id)
      .gte("reviewed_at", since)
      .order("reviewed_at")
      // Supabase returns at most 1,000 rows per request: that is over 70
      // answers a day for two weeks, plenty for one student.
      .limit(1000),
  ]);

  const error = words.error ?? reviews.error ?? correct.error ?? recent.error;
  if (error) throw new Error(`Couldn't load the dashboard: ${error.message}`);

  return {
    wordCount: words.count ?? 0,
    reviewCount: reviews.count ?? 0,
    correctCount: correct.count ?? 0,
    recent: recent.data ?? [],
  };
}
