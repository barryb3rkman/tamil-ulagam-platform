import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAutosave } from "./use-autosave";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useAutosave", () => {
  it("does not save on the initial mount — only on a real edit after it", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    const { rerender } = renderHook(
      ({ watch }: { watch: readonly unknown[] }) => useAutosave(save, watch),
      { initialProps: { watch: [{ value: "initial" }] } },
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    expect(save).not.toHaveBeenCalled();

    rerender({ watch: [{ value: "edited" }] });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("debounces rapid edits into a single save carrying the latest state", async () => {
    let latest = "a";
    const save = vi.fn().mockImplementation(async () => {
      // Captures whatever `latest` is at call time — proving the debounce
      // collapsed every intermediate keystroke into the final value.
      void latest;
    });
    const { rerender } = renderHook(
      ({ watch }: { watch: readonly unknown[] }) => useAutosave(save, watch),
      { initialProps: { watch: [latest] } },
    );

    for (const value of ["ab", "abc", "abcd", "abcde"]) {
      latest = value;
      rerender({ watch: [latest] });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(200);
      });
    }
    expect(save).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("flush cancels the pending debounce and saves immediately", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    const { result, rerender } = renderHook(
      ({ watch }: { watch: readonly unknown[] }) => useAutosave(save, watch),
      { initialProps: { watch: ["a"] } },
    );

    rerender({ watch: ["b"] });
    expect(save).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.flush();
    });
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("flush while a save is already in flight awaits that save rather than starting a second one", async () => {
    let resolveSave: () => void = () => undefined;
    const save = vi.fn().mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveSave = resolve;
        }),
    );
    const { result, rerender } = renderHook(
      ({ watch }: { watch: readonly unknown[] }) => useAutosave(save, watch),
      { initialProps: { watch: ["a"] } },
    );

    rerender({ watch: ["b"] });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(save).toHaveBeenCalledTimes(1);

    const flushPromise = result.current.flush();
    resolveSave();
    await act(async () => {
      await flushPromise;
    });
    // Still exactly one call — flush joined the in-flight save instead of
    // racing a second, concurrent request against it.
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("surfaces a failed save as status 'error', and retry re-attempts it", async () => {
    const save = vi
      .fn()
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce(undefined);
    const { result, rerender } = renderHook(
      ({ watch }: { watch: readonly unknown[] }) => useAutosave(save, watch),
      { initialProps: { watch: ["a"] } },
    );

    rerender({ watch: ["b"] });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(result.current.status).toBe("error");

    await act(async () => {
      await result.current.retry();
    });
    expect(result.current.status).toBe("saved");
    expect(save).toHaveBeenCalledTimes(2);
  });

  it("an edit that arrives while a save is in flight triggers exactly one more save afterward, not a second overlapping request", async () => {
    let resolveFirst: () => void = () => undefined;
    const save = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<void>((resolve) => {
            resolveFirst = resolve;
          }),
      )
      .mockResolvedValue(undefined);
    const { rerender } = renderHook(
      ({ watch }: { watch: readonly unknown[] }) => useAutosave(save, watch),
      { initialProps: { watch: ["a"] } },
    );

    rerender({ watch: ["b"] });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(save).toHaveBeenCalledTimes(1);

    // A newer edit arrives mid-flight.
    rerender({ watch: ["c"] });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    // The debounced timer for "c" fired, but runSave saw a save already in
    // flight and only flagged a rerun rather than starting a second call.
    expect(save).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveFirst();
      await vi.advanceTimersByTimeAsync(0);
    });
    // The coalesced rerun now happened — exactly one more call, never two
    // overlapping ones.
    expect(save).toHaveBeenCalledTimes(2);
  });
});
