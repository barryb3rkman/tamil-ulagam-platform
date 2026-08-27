"use client";

import { useMemo } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabasePublicEnvironmentConfigured } from "@/lib/supabase/environment";

import {
  createManagementService,
  type ManagementService,
} from "./management-service";

/**
 * Mirrors use-membership-service.ts (Phase A1/C2) exactly: independent
 * of PlatformProvider, shares the one browser Supabase client singleton,
 * and returns null (not a throw) when Supabase isn't configured for this
 * deployment — callers render the same "not configured" messaging the
 * rest of the app already uses.
 */
export function useManagementService(): ManagementService | null {
  return useMemo(() => {
    if (!isSupabasePublicEnvironmentConfigured()) return null;
    return createManagementService(getSupabaseBrowserClient());
  }, []);
}
