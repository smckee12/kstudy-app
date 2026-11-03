"use client";

import { useOptimistic, useState, useTransition } from "react";
import { setStar } from "@/app/actions/stars";

type Props = { cardId: number; starred: boolean; size?: "md" | "lg" };

// A ★ that turns red when starred. It changes as soon as you click
// (useOptimistic), and goes back if saving fails.
export function StarButton({ cardId, starred, size = "md" }: Props) {
  const [optimistic, setOptimistic] = useOptimistic(starred);
  const [error, setError] = useState<string>();
  const [, startTransition] = useTransition();

  function toggle() {
    const next = !optimistic;
    setError(undefined);
    startTransition(async () => {
      setOptimistic(next);
      const result = await setStar(cardId, next);
      if (result.error) setError(result.error);
    });
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={toggle}
        aria-pressed={optimistic}
        aria-label={optimistic ? "Remove star" : "Star this word"}
        title={optimistic ? "Remove star" : "Star this word"}
        className={`leading-none transition-colors ${size === "lg" ? "text-4xl" : "text-2xl"} ${
          optimistic ? "text-accent" : "text-gray-300 hover:text-gray-400"
        }`}
      >
        {optimistic ? "★" : "☆"}
      </button>
      {error && (
        <span role="alert" className="text-sm text-accent">
          {error}
        </span>
      )}
    </span>
  );
}
