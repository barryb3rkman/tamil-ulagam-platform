import { expect, test } from "@playwright/test";

test("homepage loads with primary navigation", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Connecting the Tamil world with purpose and trust",
    }),
  ).toBeVisible();

  const primaryNavigation = page.getByRole("navigation", {
    name: "Primary navigation",
  });

  await expect(primaryNavigation).toBeVisible();
  await expect(
    primaryNavigation.getByRole("link", { name: "Initiatives" }),
  ).toHaveAttribute("href", "/initiatives");
});
