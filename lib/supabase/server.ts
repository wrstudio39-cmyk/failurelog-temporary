import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/* Server-side Supabase client for use in Server Components, Route Handlers,
   and Server Actions. Reads auth from cookies so RLS applies per-request. */
export function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // called from a Server Component — middleware refreshes session instead
          }
        },
      },
    }
  );
}
