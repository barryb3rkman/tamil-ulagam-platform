"use client";

import { useMemo } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabasePublicEnvironmentConfigured } from "@/lib/supabase/environment";

import {
  createSangamRegistrationService,
  type SangamRegistrationService,
} from "./sangam-registration-service";

export function useSangamRegistrationService(): SangamRegistrationService | null {
  return useMemo(() => {
    if (!isSupabasePublicEnvironmentConfigured()) return null;
    return createSangamRegistrationService(getSupabaseBrowserClient());
  }, []);
}
