import { useCallback, useEffect, useRef, useState } from "react";

import type { AutosaveStatus } from "@/components/application/form-fields";

const DEFAULT_DELAY_MS = 1000;

export interface UseAutosaveResult {
  readonly status: AutosaveStatus;
  /**
   * Cancels any pending debounce and, if there is unsaved state, runs the
   * save immediately — awaiting the result of whichever save (the flushed
   * one, or one already in flight) settles last. Registration/Sangam
   * wizards call this before navigating Back, so edits are never lost by
   * leaving a stage before the debounce timer would otherwise have fired.
   * Continue's own submit handler doesn't need to call this — it already
   * explicitly persists the current values itself before advancing, which
   * this hook's own in-flight-coalescing (below) makes safe to run
   * alongside a pending autosave rather than racing it.
   */
  readonly flush: () => Promise<void>;
  /** Re-runs the save unconditionally — used by the "Retry" action after
   * a failed save, when there is no pending debounce timer for `flush`
   * to cancel. */
  readonly retry: () => Promise<void>;
}

/**
 * Debounced autosave for the Organisation/Sangam registration wizards
 * (H2 brief sections 13-16) — reused by both rather than two parallel
 * implementations (section 14/37: "do not create inconsistent
 * behavior"). No new backend: `save` is always one of the existing
 * `update*` service calls already used by the former manual "Save
 * progress" button and by Continue's own pre-navigation persistence.
 *
 * `watch` is the dependency array to debounce on — typically the
 * current stage's editable field objects (organisation/representative/
 * profile). Because every field's onChange handler in this codebase
 * updates state through an immutable spread (`{...value, [key]: x}`),
 * a real edit always produces a new object reference, which is exactly
 * what makes a plain `useEffect` dependency array a correct "did
 * anything change" signal here — no separate dirty-tracking needed.
 * The very first render (the draft loading from the server) is
 * deliberately skipped so hydration itself never triggers a save.
 *
 * Concurrency (section 15): only one save is ever in flight, run as a
 * single async loop (never self-recursive — a genuinely self-recursive
 * useCallback can't be proven stable by React's compiler lint rules)
 * that keeps saving again in place while `rerunRequestedRef` is set. An
 * edit that arrives while a save is running doesn't start a second,
 * possibly-out-of-order request — it flags that flag, so the loop does
 * one more pass (capturing whatever `save` closure is current by then)
 * before finishing. A rapid burst of edits therefore collapses into at
 * most two network calls: the one already in flight, plus one final one
 * carrying the latest state — never a pile of overlapping requests, and
 * never a stale response clobbering a newer edit, since saves are
 * serialized rather than raced.
 */
export function useAutosave(
  save: () => Promise<void>,
  watch: readonly unknown[],
  options?: { readonly delayMs?: number; readonly enabled?: boolean },
): UseAutosaveResult {
  const delayMs = options?.delayMs ?? DEFAULT_DELAY_MS;
  const enabled = options?.enabled ?? true;

  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightPromiseRef = useRef<Promise<void> | null>(null);
  const rerunRequestedRef = useRef(false);
  const hasMountedRef = useRef(false);

  const runSave = useCallback((): Promise<void> => {
    if (inFlightPromiseRef.current) {
      rerunRequestedRef.current = true;
      return inFlightPromiseRef.current;
    }
    const attempt = (async () => {
      let again = true;
      while (again) {
        setStatus("saving");
        try {
          await saveRef.current();
          setStatus("saved");
        } catch {
          setStatus("error");
        }
        if (rerunRequestedRef.current) {
          rerunRequestedRef.current = false;
        } else {
          again = false;
        }
      }
      inFlightPromiseRef.current = null;
    })();
    inFlightPromiseRef.current = attempt;
    return attempt;
  }, []);

  const flush = useCallback((): Promise<void> => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      return runSave();
    }
    return inFlightPromiseRef.current ?? Promise.resolve();
  }, [runSave]);

  useEffect(() => {
    if (!enabled) return;
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      void runSave();
    }, delayMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `watch` is the intentional, caller-provided dependency list.
  }, watch);

  return { status, flush, retry: runSave };
}
