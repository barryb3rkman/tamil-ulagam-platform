"use client";

import { useMemo } from "react";

import { usePlatform } from "@/features/enrollment/platform-provider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getPlatformRuntimeEnvironment } from "@/lib/supabase/environment";

import {
  createAdminOperationsService,
  type AdminOperationsService,
} from "./admin-operations-service";
import { createMockAdminOperationsService } from "./mock-admin-operations-service";

let mockService: AdminOperationsService | undefined;

export function useAdminOperationsService(): AdminOperationsService | null {
  const { backendKind } = usePlatform();
  return useMemo(() => {
    if (backendKind === "supabase") {
      return createAdminOperationsService(getSupabaseBrowserClient());
    }
    if (backendKind === "mock") {
      mockService ??= createMockAdminOperationsService();
      return mockService;
    }
    return null;
  }, [backendKind]);
}

/** Public-safe service selection for the anonymous partnership form. */
export function usePublicPartnershipService(): AdminOperationsService | null {
  return useMemo(() => {
    const environment = getPlatformRuntimeEnvironment();
    if (
      environment.backend === "supabase-local" ||
      environment.backend === "supabase-hosted"
    ) {
      return createAdminOperationsService(getSupabaseBrowserClient());
    }
    if (environment.backend === "mock") {
      mockService ??= createMockAdminOperationsService();
      return mockService;
    }
    return null;
  }, []);
}
