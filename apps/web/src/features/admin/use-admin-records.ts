"use client";

import { useCallback, useEffect, useState } from "react";

import { getPlatformErrorMessage } from "@/lib/supabase/errors";

/**
 * The list behind an Admin operations screen: load on mount, expose a
 * reload for after a decision, and turn a failure into a message.
 *
 * Memberships and partnership enquiries had this written out twice,
 * including a `load` callback whose body duplicated the mount effect. The
 * two copies had already drifted — only the effect guarded against
 * resolving after unmount.
 */
export function useAdminRecords<Record>({
  enabled,
  load,
}: {
  readonly enabled: boolean;
  readonly load: (() => Promise<Record[]>) | null;
}) {
  const [records, setRecords] = useState<Record[]>([]);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  // Which reload has finished, rather than a loading flag set at the top
  // of the effect. Setting state synchronously in an effect costs an
  // extra render pass on every load and every reload.
  const [settledKey, setSettledKey] = useState(-1);

  useEffect(() => {
    if (!enabled || !load) return;
    let cancelled = false;
    load()
      .then((items) => {
        if (cancelled) return;
        setRecords(items);
        setError("");
      })
      .catch((caught: unknown) => {
        if (!cancelled) setError(getPlatformErrorMessage(caught));
      })
      .finally(() => {
        if (!cancelled) setSettledKey(reloadKey);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, load, reloadKey]);

  const reload = useCallback(() => {
    setReloadKey((value) => value + 1);
  }, []);

  return {
    records,
    loading: enabled && settledKey !== reloadKey,
    error,
    reload,
  };
}

/** The history strip for whichever record is open. Failures leave it
 * empty rather than blocking the decision the admin came to make. */
export function useAdminHistory<Event>({
  load,
  recordId,
}: {
  readonly load: ((id: string) => Promise<Event[]>) | null;
  readonly recordId: string | null;
}) {
  const [reloadKey, setReloadKey] = useState(0);
  const [loaded, setLoaded] = useState<{
    readonly id: string;
    readonly events: Event[];
  } | null>(null);

  useEffect(() => {
    if (!load || !recordId) return;
    let cancelled = false;
    load(recordId)
      .then((events) => {
        if (!cancelled) setLoaded({ id: recordId, events });
      })
      .catch(() => {
        if (!cancelled) setLoaded({ id: recordId, events: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [load, recordId, reloadKey]);

  // Recording a decision adds an entry but leaves the record id alone, so
  // without an explicit reload the strip would keep showing the history
  // as it was before the decision.
  const reload = useCallback(() => {
    setReloadKey((value) => value + 1);
  }, []);

  // Derived rather than cleared in the effect, so switching records never
  // shows the previous record's history for a frame.
  return {
    history: loaded && loaded.id === recordId ? loaded.events : [],
    reload,
  };
}

/**
 * The confirm-and-apply step shared by every Admin decision: which action
 * is pending, the note attached to it, and whether it is in flight.
 *
 * `noteRequirement` returns the message to show when an action cannot be
 * recorded without a reason, or null when it can. The rule and its
 * wording belong to the caller — memberships and partnerships word this
 * differently — while the enforcement lives here.
 */
export function useAdminDecision<Action extends string>({
  noteRequirement,
}: {
  readonly noteRequirement: (action: Action) => string | null;
}) {
  const [action, setAction] = useState<Action | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const begin = useCallback((next: Action | null) => {
    setAction(next);
    setNote("");
    setError("");
  }, []);

  const run = useCallback(
    async (
      apply: (action: Action, note: string | undefined) => Promise<void>,
    ) => {
      if (!action) return;
      const trimmed = note.trim();
      const required = noteRequirement(action);
      if (required && !trimmed) {
        setError(required);
        return;
      }
      setPending(true);
      setError("");
      try {
        await apply(action, trimmed || undefined);
        setAction(null);
        setNote("");
      } catch (caught: unknown) {
        setError(getPlatformErrorMessage(caught));
      } finally {
        setPending(false);
      }
    },
    [action, note, noteRequirement],
  );

  // Typing a reason clears the "enter a reason" complaint, rather than
  // leaving it up while the admin is answering it.
  const updateNote = useCallback((value: string) => {
    setNote(value);
    setError("");
  }, []);

  return { action, begin, error, note, pending, run, setNote: updateNote };
}
