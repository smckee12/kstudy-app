"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { SORTS, type CardFilters, type Sort } from "@/lib/card-filters";
import type { LessonWithCount } from "@/lib/data";

type Props = {
  filters: CardFilters;
  lessons: Pick<LessonWithCount, "id" | "number" | "topic_korean" | "topic_english">[];
};

const controlClass =
  "rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-navy focus:outline-none";

// The search box, lesson and starred filters, and sort menu on My words.
// Each change updates the URL (?q=…&lesson=…), and the page reloads the
// matching words from the database on the server.
export function CardFiltersBar({ filters, lessons }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(filters.search);
  const [sentSearch, setSentSearch] = useState(filters.search);
  const typingTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // If the URL's search changed by something other than typing here (the
  // Back button, or "Clear the search and filters"), show it in the box.
  if (filters.search !== sentSearch) {
    setSentSearch(filters.search);
    setSearch(filters.search);
  }

  useEffect(() => () => clearTimeout(typingTimer.current), []);

  // Puts the filters in the URL, leaving out the defaults so a plain
  // /cards still means "everything, newest first".
  function apply(next: Partial<CardFilters>) {
    const f = { ...filters, search, ...next };
    const params = new URLSearchParams();
    if (f.search.trim()) params.set("q", f.search.trim());
    if (f.lessonId !== null) params.set("lesson", String(f.lessonId));
    if (f.starredOnly) params.set("starred", "1");
    if (f.sort !== "newest") params.set("sort", f.sort);
    setSentSearch(f.search.trim());
    const qs = params.toString();
    startTransition(() => router.replace(qs ? `/cards?${qs}` : "/cards", { scroll: false }));
  }

  // Waits until I stop typing for a moment, so it doesn't search on every key.
  function onSearchChange(value: string) {
    setSearch(value);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => apply({ search: value }), 300);
  }

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        clearTimeout(typingTimer.current);
        apply({});
      }}
      className="mt-6 flex flex-col gap-3 rounded-xl bg-surface p-4"
      aria-busy={isPending}
    >
      <input
        type="search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search in Korean or English…"
        aria-label="Search words in Korean or English"
        maxLength={100}
        className={`${controlClass} text-lg`}
      />
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <select
          value={filters.lessonId ?? ""}
          onChange={(e) => apply({ lessonId: e.target.value ? Number(e.target.value) : null })}
          aria-label="Filter by lesson"
          className={controlClass}
        >
          <option value="">All lessons</option>
          {lessons.map((lesson) => (
            <option key={lesson.id} value={lesson.id}>
              Lesson {lesson.number} · {lesson.topic_korean}
              {lesson.topic_english ? ` (${lesson.topic_english})` : ""}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2">
          <input
            type="checkbox"
            checked={filters.starredOnly}
            onChange={(e) => apply({ starredOnly: e.target.checked })}
            className="accent-accent"
          />
          <span>
            <span className="text-accent">★</span> Starred only
          </span>
        </label>

        <label className="ml-auto flex items-center gap-2">
          <span className="text-gray-600">Sort</span>
          <select
            value={filters.sort}
            onChange={(e) => apply({ sort: e.target.value as Sort })}
            className={controlClass}
          >
            {Object.entries(SORTS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </form>
  );
}
