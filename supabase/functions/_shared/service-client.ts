import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

import { parseSecretKeysDictionary } from "./secret-keys.ts";

export function createServiceRoleClient(supabaseUrl: string): SupabaseClient {
  const secretKey = parseSecretKeysDictionary(
    Deno.env.get("SUPABASE_SECRET_KEYS"),
  );
  return createClient(supabaseUrl, secretKey);
}
