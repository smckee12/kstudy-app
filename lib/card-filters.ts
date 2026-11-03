// The search, filter and sort choices on My words. They live in the URL
// (e.g. /cards?q=학교&lesson=3&starred=1&sort=korean), so a search can be
// reloaded, bookmarked or shared, and the Back button works.

export const SORTS = {
  newest: "Newest first",
  korean: "가나다 order",
  lesson: "By lesson",
} as const;

export type Sort = keyof typeof SORTS;

export type CardFilters = {
  search: string;
  lessonId: number | null;
  starredOnly: boolean;
  sort: Sort;
};

type SearchParams = { [key: string]: string | string[] | undefined };

const first = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value) ?? "";

// Turns the URL's ?q=…&lesson=…&starred=…&sort=… into filters. Anything
// unexpected (a made-up sort, a lesson that isn't a number) falls back to
// the default instead of breaking the page.
export function parseFilters(params: SearchParams): CardFilters {
  const lesson = first(params.lesson);
  const sort = first(params.sort);
  return {
    search: first(params.q).trim().slice(0, 100),
    lessonId: /^\d+$/.test(lesson) ? Number(lesson) : null,
    starredOnly: first(params.starred) === "1",
    sort: sort in SORTS ? (sort as Sort) : "newest",
  };
}

export const isFiltering = (f: CardFilters) =>
  f.search !== "" || f.lessonId !== null || f.starredOnly;
