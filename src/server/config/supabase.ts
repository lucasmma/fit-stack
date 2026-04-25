import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "./env";

let adminClient: SupabaseClient | null = null;

/**
 * Service-role client for privileged server actions (seed, admin ops).
 * Bypasses RLS — authorization is enforced in our data layer via userId filters.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (!adminClient) {
    adminClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return adminClient;
}
