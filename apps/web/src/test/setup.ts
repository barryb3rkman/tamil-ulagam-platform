import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Vitest runs without `globals`, so Testing Library cannot register its
// own afterEach hook. Without this every suite has to call cleanup by
// hand, and any that forgets leaks mounted components into the next test.
afterEach(cleanup);

process.env.NEXT_PUBLIC_ENROLLMENT_BACKEND = "mock";

if (typeof window !== "undefined" && !window.localStorage) {
  const values = new Map<string, string>();
  const storage: Storage = {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, String(value)),
  };
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: storage,
  });
}

// jsdom has no layout engine and does not implement scrollIntoView.
if (typeof Element !== "undefined" && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => undefined;
}

// jsdom ships <dialog> without showModal/close, so any component built on
// the native element throws the moment it opens.
if (typeof HTMLDialogElement !== "undefined") {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function showModal(
      this: HTMLDialogElement,
    ) {
      this.open = true;
    };
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function close(
      this: HTMLDialogElement,
    ) {
      this.open = false;
      this.dispatchEvent(new Event("close"));
    };
  }
}
