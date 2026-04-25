import "server-only";
import { cookies } from "next/headers";
import { createServerClient as createSsrClient, type CookieOptions } from "@supabase/ssr";

export async function createServerClient() {
  const cookieStore = await cookies();
  return createSsrClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // setAll is called from Server Components during render, where the
            // cookie store is readonly. Safe to ignore — middleware refreshes
            // the session cookies on each request.
          }
        },
      },
    },
  );
}
