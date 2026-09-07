"use client";

import { useEffect, useRef } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabasePublicEnvironmentConfigured } from "@/lib/supabase/environment";

/** The tables carried by the `supabase_realtime` publication. */
export type RealtimeTable =
  | "organization_memberships"
  | "organization_applications"
  | "organization_managers"
  | "partnership_enquiries";

export function useRealtimeRefresh({
  enabled = true,
  filter,
  onChange,
  table,
}: {
  readonly enabled?: boolean;
  readonly filter?: string;
  readonly onChange: () => void;
  /** Null when the caller has nothing to watch, so the hook can still be
   * called unconditionally. */
  readonly table: RealtimeTable | null;
}) {
  const handler = useRef(onChange);
  useEffect(() => {
    handler.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!enabled || !table) return;
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
