import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// A Supabase client for Server Components and Server Actions.
// It reads and writes the login session through the request's cookies.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Components can't set cookies. That's fine: proxy.ts
            // refreshes the session on every request instead.
          }
        },
      },
    },
  );
}

// Returns the logged-in user's id and email, or null if nobody is logged in.
export async function getCurrentUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) return null;
  return { id: claims.sub, email: claims.email as string };
}
