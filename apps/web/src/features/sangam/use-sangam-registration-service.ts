"use client";

import { useMemo } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabasePublicEnvironmentConfigured } from "@/lib/supabase/environment";

import {
  createSangamRegistrationService,
  type SangamRegistrationService,
} from "./sangam-registration-service";

/**
 * Mirrors useMembershipService() (Phase A1/C2): independent of
 * PlatformProvider but shares its browser Supabase client singleton, so
 * it always sees the same authenticated session. Returns null when
 * Supabase isn't configured for this deployment — callers render the
 * same "not configured for this deployment" messaging used elsewhere
 * rather than crashing.
 */
export function useSangamRegistrationService(): SangamRegistrationService | null {
  return useMemo(() => {
    if (!isSupabasePublicEnvironmentConfigured()) return null;
    return createSangamRegistrationService(getSupabaseBrowserClient());
  }, []);
}
