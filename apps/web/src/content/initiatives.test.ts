import { describe, expect, it } from "vitest";

import { initiatives } from "./initiatives";

describe("initiative content", () => {
  it("uses unique routes, typed statuses, and showcase descriptions", () => {
    const hrefs = initiatives.map((initiative) => initiative.href);

    expect(new Set(hrefs).size).toBe(hrefs.length);
    expect(
      initiatives.every((initiative) => initiative.status === "planned"),
    ).toBe(true);
    expect(
      initiatives.every(
        (initiative) =>
          !/planned|proposed|not currently available/i.test(
            initiative.description,
          ),
      ),
    ).toBe(true);
  });
});
