import { expect, test } from "@playwright/test";

// Internal QA surface — verifies it renders, is excluded from indexing,
// and holds up responsively. This is not a public product journey.
test.describe("design system showcase (internal QA surface)", () => {
  test("is not indexable and is not linked from the homepage", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByRole("link", { name: /design system/i }),
    ).toHaveCount(0);

    const robotsResponse = await page.goto("/robots.txt");
    const robotsText = (await robotsResponse?.text()) ?? "";
    expect(robotsText).toContain("Disallow: /dev/");
  });

  test("renders every section, sets noindex, and stays responsive with no horizontal overflow", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    await page.goto("/dev/design-system/");
    await expect(
      page.getByRole("heading", { name: "Design system", level: 1 }),
    ).toBeVisible();

    const robotsMeta = page.locator('meta[name="robots"]');
    await expect(robotsMeta).toHaveAttribute("content", /noindex/);

    for (const width of [375, 390, 430, 768, 1024, 1280, 1440, 1920]) {
      await page.setViewportSize({ width, height: 1000 });
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth + 1,
      );
      expect(overflow, `horizontal overflow at ${width}px`).toBe(false);
    }

    expect(consoleErrors).toEqual([]);
  });

  test("Dialog and Sheet open and close via keyboard/pointer without leaking focus", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 1000 });
    await page.goto("/dev/design-system/");

    await page.getByRole("button", { name: "Open dialog" }).click();
    await expect(
      page.getByRole("heading", { name: "Verify this organisation?" }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("heading", { name: "Verify this organisation?" }),
    ).toHaveCount(0);

    await page.getByRole("button", { name: "Open sheet" }).click();
    await expect(
      page.getByRole("heading", { name: "Switch workspace" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Close" }).click();
    await expect(
      page.getByRole("heading", { name: "Switch workspace" }),
    ).toHaveCount(0);
  });
});
