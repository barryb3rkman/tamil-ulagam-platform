// Shared service-role-equivalent client factory for every trusted Edge
// Function in this project (H6.2: migrated off the legacy
// SUPABASE_SERVICE_ROLE_KEY JWT toward Supabase's current secret-key
// system for hosted Edge Functions). The actual parsing/validation of
// SUPABASE_SECRET_KEYS lives in secret-keys.ts (pure, Node-testable);
// this file only adds the Deno.env.get read and client construction.
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

import { parseSecretKeysDictionary } from "./secret-keys.ts";

export function createServiceRoleClient(supabaseUrl: string): SupabaseClient {
  const secretKey = parseSecretKeysDictionary(
    Deno.env.get("SUPABASE_SECRET_KEYS"),
  );
  return createClient(supabaseUrl, secretKey);
}
