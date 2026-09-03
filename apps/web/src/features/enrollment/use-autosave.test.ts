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
      await expect(result.current.flush()).resolves.toBe(true);
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
      await expect(result.current.retry()).resolves.toBe(true);
    });
    expect(result.current.status).toBe("saved");
    expect(save).toHaveBeenCalledTimes(2);
  });

  it("reports a failed flush so a registration stage can block navigation", async () => {
    const save = vi.fn().mockRejectedValue(new Error("network"));
    const { result, rerender } = renderHook(
      ({ watch }: { watch: readonly unknown[] }) => useAutosave(save, watch),
      { initialProps: { watch: ["a"] } },
    );

    rerender({ watch: ["edited"] });
    await act(async () => {
      await expect(result.current.flush()).resolves.toBe(false);
    });

    expect(result.current.status).toBe("error");
    expect(save).toHaveBeenCalledOnce();
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
    expect(save).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveFirst();
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(save).toHaveBeenCalledTimes(2);
  });
});
