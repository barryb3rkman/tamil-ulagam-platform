"use client";

import { useMemo } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabasePublicEnvironmentConfigured } from "@/lib/supabase/environment";

import {
  createMembershipService,
  type MembershipService,
} from "./membership-service";

/**
 * The membership service is intentionally independent of PlatformProvider
 * (see membership-service.ts's own doc comment) but shares its browser
 * Supabase client singleton, so it always sees the same authenticated
 * session PlatformProvider itself resolved — there is only ever one
 * client instance per page.
 *
 * Returns null when Supabase isn't configured for this deployment (e.g.
 * a local `mock` backend run) rather than throwing — callers should
 * treat null as "member features unavailable here" and render the same
 * "not configured for this deployment" messaging the rest of the app
 * already uses for platformError, not crash the page.
 */
export function useMembershipService(): MembershipService | null {
  return useMemo(() => {
    if (!isSupabasePublicEnvironmentConfigured()) return null;
    return createMembershipService(getSupabaseBrowserClient());
  }, []);
}
