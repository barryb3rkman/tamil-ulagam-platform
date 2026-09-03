import { useCallback, useEffect, useRef, useState } from "react";

import type { AutosaveStatus } from "@/components/application/form-fields";

const DEFAULT_DELAY_MS = 1000;

export interface UseAutosaveResult {
  readonly status: AutosaveStatus;
  readonly flush: () => Promise<boolean>;
  readonly retry: () => Promise<boolean>;
}

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
  const inFlightPromiseRef = useRef<Promise<boolean> | null>(null);
  const rerunRequestedRef = useRef(false);
  const hasMountedRef = useRef(false);

  const runSave = useCallback((): Promise<boolean> => {
    if (inFlightPromiseRef.current) {
      rerunRequestedRef.current = true;
      return inFlightPromiseRef.current;
    }
    const attempt = (async () => {
      let again = true;
      let succeeded = true;
      while (again) {
        setStatus("saving");
        try {
          await saveRef.current();
          setStatus("saved");
          succeeded = true;
        } catch {
          setStatus("error");
          succeeded = false;
        }
        if (rerunRequestedRef.current) {
          rerunRequestedRef.current = false;
        } else {
          again = false;
        }
      }
      inFlightPromiseRef.current = null;
      return succeeded;
    })();
    inFlightPromiseRef.current = attempt;
    return attempt;
  }, []);

  const flush = useCallback((): Promise<boolean> => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      return runSave();
    }
    return inFlightPromiseRef.current ?? Promise.resolve(true);
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
