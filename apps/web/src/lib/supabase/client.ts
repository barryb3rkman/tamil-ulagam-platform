"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";
import { getSupabasePublicEnvironment } from "./environment";

let browserClient: SupabaseClient<Database> | undefined;

export function getSupabaseBrowserClient(): SupabaseClient<Database> {
  if (!browserClient) {
    const { url, publishableKey } = getSupabasePublicEnvironment();
    browserClient = createBrowserClient<Database>(url, publishableKey);
  }

  return browserClient;
}
