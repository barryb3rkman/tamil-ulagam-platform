import type { MockPlatformState } from "@tamil-ulagam/shared";

import { createSeedState } from "./mock-data";

export interface MockStateRepository {
  load(): MockPlatformState;
  save(state: MockPlatformState): void;
  reset(): MockPlatformState;
}

export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const mockStorageKey = "tamil-ulagam:mvp-state:v1";

function isMockPlatformState(value: unknown): value is MockPlatformState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<MockPlatformState>;
  const validStatus = new Set([
    "draft",
    "submitted",
    "under_review",
    "needs_changes",
    "verified",
    "rejected",
    "suspended",
  ]);
  return (
    candidate.version === 1 &&
    Array.isArray(candidate.users) &&
    candidate.users.every(
      (user) =>
        user &&
        typeof user === "object" &&
        typeof (user as { id?: unknown }).id === "string" &&
        typeof (user as { email?: unknown }).email === "string",
    ) &&
    Array.isArray(candidate.organisations) &&
    candidate.organisations.every(
      (organisation) =>
        organisation &&
        typeof organisation === "object" &&
        typeof (organisation as { id?: unknown }).id === "string" &&
        typeof (organisation as { name?: unknown }).name === "string",
    ) &&
    Array.isArray(candidate.memberships) &&
    candidate.memberships.every(
      (membership) =>
        membership &&
        typeof membership === "object" &&
        typeof (membership as { userId?: unknown }).userId === "string" &&
        typeof (membership as { organisationId?: unknown }).organisationId ===
          "string",
    ) &&
    Array.isArray(candidate.registrations) &&
    candidate.registrations.every(
      (registration) =>
        registration &&
        typeof registration === "object" &&
        typeof (registration as { id?: unknown }).id === "string" &&
        validStatus.has(
          String((registration as { status?: unknown }).status ?? ""),
        ) &&
        typeof (registration as { representative?: unknown }).representative ===
          "object",
    )
  );
}

export class BrowserMockStateRepository implements MockStateRepository {
  constructor(private readonly storage: StorageAdapter | null) {}

  load(): MockPlatformState {
    if (!this.storage) return createSeedState();

    const stored = this.storage.getItem(mockStorageKey);
    if (!stored) {
      const initial = createSeedState();
      this.save(initial);
      return initial;
    }

    try {
      const parsed: unknown = JSON.parse(stored);
      if (isMockPlatformState(parsed)) return parsed;
    } catch {
      // Invalid local demo data is safely replaced with the known seed state.
    }

    return this.reset();
  }

  save(state: MockPlatformState): void {
    this.storage?.setItem(mockStorageKey, JSON.stringify(state));
  }

  reset(): MockPlatformState {
    const initial = createSeedState();
    if (this.storage) {
      this.storage.removeItem(mockStorageKey);
      this.storage.setItem(mockStorageKey, JSON.stringify(initial));
    }
    return initial;
  }
}
