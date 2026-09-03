"use client";

import { useMemo } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabasePublicEnvironmentConfigured } from "@/lib/supabase/environment";

import {
  createManagementService,
  type ManagementService,
} from "./management-service";

export function useManagementService(): ManagementService | null {
  return useMemo(() => {
    if (!isSupabasePublicEnvironmentConfigured()) return null;
    return createManagementService(getSupabaseBrowserClient());
  }, []);
}
