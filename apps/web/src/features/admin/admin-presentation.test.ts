import { describe, expect, it } from "vitest";

import {
  membershipStatusPresentation,
  partnershipStatusPresentation,
  registrationStatusPresentation,
} from "./admin-presentation";

describe("Admin lifecycle presentation", () => {
  it("provides authored labels for every partnership status", () => {
    expect(Object.keys(partnershipStatusPresentation)).toEqual([
      "new",
      "in_discussion",
      "active",
      "declined",
    ]);
    expect(partnershipStatusPresentation.in_discussion.label).toBe(
      "In discussion",
    );
  });

  it("keeps membership and registration labels centralized", () => {
    expect(membershipStatusPresentation.pending.label).toBe("Pending");
    expect(registrationStatusPresentation.needs_changes.label).toBe(
      "Changes requested",
    );
  });
});
