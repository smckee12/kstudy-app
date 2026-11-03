import Link from "next/link";

// Shown for a card id that doesn't exist or belongs to another user.
export function CardNotFound() {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-12">
      <h1 className="text-3xl font-bold text-navy">Card not found</h1>
      <p className="mt-2 text-gray-600">
        This word doesn&apos;t exist, or it isn&apos;t in your word bank.
      </p>
      <Link href="/cards" className="mt-6 inline-block font-semibold text-navy underline">
        Back to my words
      </Link>
    </main>
  );
}
