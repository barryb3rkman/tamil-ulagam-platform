"use client";

import { useEffect, useRef } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabasePublicEnvironmentConfigured } from "@/lib/supabase/environment";

export function useRealtimeRefresh({
  enabled = true,
  filter,
  onChange,
  table,
}: {
  readonly enabled?: boolean;
  readonly filter?: string;
  readonly onChange: () => void;
  readonly table:
    | "organization_memberships"
    | "organization_applications"
    | "organization_managers";
}) {
  const handler = useRef(onChange);
  useEffect(() => {
    handler.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!enabled) return;
    if (!isSupabasePublicEnvironmentConfigured()) return;

    const client = getSupabaseBrowserClient();
    const channel = client
      .channel(`realtime:${table}:${filter ?? "all"}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table, ...(filter ? { filter } : {}) },
        () => handler.current(),
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [enabled, filter, table]);
}
