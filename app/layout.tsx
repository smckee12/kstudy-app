import type { Metadata } from "next";
import Link from "next/link";
import { Noto_Sans_KR } from "next/font/google";
import { logOut } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/supabase/server";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "K-Study",
  description: "Study Korean vocab from your textbook and track how well you know it.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();

  return (
    <html lang="en" className={`${notoSansKr.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <header className="bg-navy text-white">
          <nav className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-lg font-bold">
              K-Study <span className="font-normal opacity-80">한국어</span>
            </Link>
            {user && (
              <div className="flex items-center gap-4">
                <Link href="/cards" className="text-sm font-semibold hover:underline">
                  My words
                </Link>
                <form action={logOut}>
                  <button
                    type="submit"
                    className="rounded-lg border border-white/40 px-3 py-1 text-sm hover:bg-white/10"
                  >
                    Log out
                  </button>
                </form>
              </div>
            )}
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
