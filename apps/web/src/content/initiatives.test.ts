import { describe, expect, it } from "vitest";

import { initiatives } from "./initiatives";

describe("initiative content", () => {
  it("uses unique routes and honest initial statuses", () => {
    const hrefs = initiatives.map((initiative) => initiative.href);

    expect(new Set(hrefs).size).toBe(hrefs.length);
    expect(
      initiatives.every((initiative) => initiative.status === "planned"),
    ).toBe(true);
    expect(
      initiatives.every((initiative) =>
        initiative.description.toLowerCase().includes("currently"),
      ),
    ).toBe(true);
  });
});
