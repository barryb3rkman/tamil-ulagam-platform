"use client";

import { useEffect, useState } from "react";

import type { PlatformServices } from "./contracts";

/**
 * Organisations the signed-in account manages through a management
 * grant, which is not the same as belonging to one. A manager reaches an
 * organisation they run but never joined through this set.
 *
 * The provider used to query Supabase for this inline, which meant the
 * mock backend never had an answer and the two behaved differently. It
 * now goes through the platform contract like everything else.
 */
export function useManagedOrganisationIds(
  services: PlatformServices | null,
  userId: string | null,
): ReadonlySet<string> {
  const [loaded, setLoaded] = useState<{
    readonly userId: string;
    readonly ids: ReadonlySet<string>;
  } | null>(null);

  useEffect(() => {
    if (!services || !userId) return;
    let cancelled = false;
    services
      .listManagedOrganisationIds(userId)
      .then((ids) => {
        if (!cancelled) setLoaded({ userId, ids: new Set(ids) });
      })
      .catch(() => {
        if (!cancelled) setLoaded({ userId, ids: new Set() });
      });
    return () => {
      cancelled = true;
    };
  }, [services, userId]);

  // Derived rather than reset inside the effect, so signing in as
  // someone else never briefly shows the previous account's grants.
  return loaded && loaded.userId === userId ? loaded.ids : EMPTY;
}

const EMPTY: ReadonlySet<string> = new Set();
