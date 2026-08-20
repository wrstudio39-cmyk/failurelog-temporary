import { createBrowserClient } from "@supabase/ssr";

/* Browser-side Supabase client. Env vars must be set in .env.local:
   NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
   Never put the service_role key in any client-reachable file. */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
