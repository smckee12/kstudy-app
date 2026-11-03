import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";

// Home page. Only logged-in users get here (see proxy.ts).
export default async function Home() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
      <h1 className="text-3xl font-bold text-navy">안녕하세요!</h1>
      <p className="mt-2 text-gray-700">
        You&apos;re logged in as <strong>{user.email}</strong>.
      </p>
      <p className="mt-6 rounded-xl bg-surface p-6 text-gray-600">
        Your lessons and vocab cards will show up here once they&apos;re built.
      </p>
    </main>
  );
}
