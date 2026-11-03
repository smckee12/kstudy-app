"use client";

import { useState, useTransition } from "react";

type Props = { action: () => Promise<{ error?: string }> };

// A Delete button that asks "Are you sure?" before deleting anything.
export function DeleteButton({ action }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-lg border border-accent px-4 py-2 font-semibold text-accent hover:bg-red-50"
      >
        Delete
      </button>
    );
  }

  return (
    <div role="alertdialog" aria-label="Confirm delete" className="flex flex-wrap items-center gap-3 rounded-lg bg-red-50 px-4 py-3">
      <p className="text-sm font-medium text-accent">
        Are you sure? This word will be deleted for good.
      </p>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await action();
            if (result?.error) setError(result.error);
          })
        }
        className="rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Deleting…" : "Yes, delete"}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => setConfirming(false)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700"
      >
        Cancel
      </button>
      {error && <p role="alert" className="w-full text-sm text-accent">{error}</p>}
    </div>
  );
}
