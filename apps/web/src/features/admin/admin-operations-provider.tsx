"use client";

import type { FederationCapabilities } from "@tamil-ulagam/shared";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { usePlatform } from "@/features/enrollment/platform-provider";
import { getPlatformErrorMessage } from "@/lib/supabase/errors";

import type { AdminOperationsService } from "./admin-operations-service";
import { useAdminOperationsService } from "./use-admin-operations";

interface AdminOperationsContextValue {
  readonly service: AdminOperationsService | null;
  readonly capabilities: FederationCapabilities;
  readonly loading: boolean;
  readonly error: string;
}

const emptyCapabilities: FederationCapabilities = {
  canReviewRegistrations: false,
  canOperateFederation: false,
};

const AdminOperationsContext =
  createContext<AdminOperationsContextValue | null>(null);

export function AdminOperationsProvider({
  children,
}: {
  readonly children: ReactNode;
}) {
  const { currentUser, isHydrated } = usePlatform();
  const service = useAdminOperationsService();
  const [capabilities, setCapabilities] =
    useState<FederationCapabilities>(emptyCapabilities);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isHydrated) return;
    let cancelled = false;
    const capabilityRequest =
      service && currentUser
        ? service.getCapabilities()
        : Promise.resolve(emptyCapabilities);
    capabilityRequest
      .then((nextCapabilities) => {
        if (cancelled) return;
        setCapabilities(nextCapabilities);
        setError("");
      })
      .catch((caught: unknown) => {
        if (cancelled) return;
        setCapabilities(emptyCapabilities);
        setError(getPlatformErrorMessage(caught));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [currentUser, isHydrated, service]);

  const value = useMemo<AdminOperationsContextValue>(
    () => ({
      service,
      capabilities,
      loading: !isHydrated || loading,
      error,
    }),
    [capabilities, error, isHydrated, loading, service],
  );

  return (
    <AdminOperationsContext.Provider value={value}>
      {children}
    </AdminOperationsContext.Provider>
  );
}

export function useAdminOperations(): AdminOperationsContextValue {
  const context = useContext(AdminOperationsContext);
  if (!context)
    throw new Error(
      "useAdminOperations must be used inside AdminOperationsProvider.",
    );
  return context;
}
