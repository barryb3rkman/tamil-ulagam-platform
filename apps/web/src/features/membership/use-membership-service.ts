"use client";

import { useMemo } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabasePublicEnvironmentConfigured } from "@/lib/supabase/environment";

import {
  createMembershipService,
  type MembershipService,
} from "./membership-service";

export function useMembershipService(): MembershipService | null {
  return useMemo(() => {
    if (!isSupabasePublicEnvironmentConfigured()) return null;
    return createMembershipService(getSupabaseBrowserClient());
  }, []);
}
