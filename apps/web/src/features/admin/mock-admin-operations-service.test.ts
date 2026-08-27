import { beforeEach, describe, expect, it } from "vitest";

import { createMockAdminOperationsService } from "./mock-admin-operations-service";

const storageKey = "tamil-ulagam-admin-operations-v1";

describe("mock Admin operations persistence", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("rejects malformed persisted records instead of trusting localStorage", async () => {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        partnerships: [{ id: "untrusted", status: "admin_only" }],
        partnershipHistory: "not-an-array",
      }),
    );

    const service = createMockAdminOperationsService();

    await expect(service.listPartnershipEnquiries()).resolves.toEqual([]);
    await expect(service.listPartnershipHistory("untrusted")).resolves.toEqual(
      [],
    );
  });
});
