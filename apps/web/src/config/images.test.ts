import { existsSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { homepageEditorialImageKeys, images } from "./images";

function ratioValue(ratio: `${number}/${number}`): number {
  const [width, height] = ratio.split("/").map(Number);

  if (!width || !height) {
    throw new Error(`Invalid image ratio: ${ratio}`);
  }

  return width / height;
}

describe("image registry", () => {
  it("references available files with dimensions matching their ratios", () => {
    for (const asset of Object.values(images)) {
      const desktopFile = path.join(
        process.cwd(),
        "public",
        asset.path.replace(/^\//, ""),
      );

      expect(existsSync(desktopFile), asset.path).toBe(true);
      expect(asset.available, asset.path).toBe(true);
      expect(asset.width / asset.height).toBeCloseTo(
        ratioValue(asset.aspectRatio),
        2,
      );

      if (asset.mobileAlternative) {
        const mobileFile = path.join(
          process.cwd(),
          "public",
          asset.mobilePath.replace(/^\//, ""),
        );

        expect(existsSync(mobileFile), asset.mobilePath).toBe(true);
        expect(asset.mobileWidth / asset.mobileHeight).toBeCloseTo(
          ratioValue(asset.mobileAspectRatio),
          2,
        );
      }
    }
  });

  it("prioritises the approved page heroes only", () => {
    const priorityEntries = Object.entries(images)
      .filter(([, asset]) => asset.aboveFold)
      .map(([key]) => key);

    expect(priorityEntries).toEqual(["homeHero", "aboutHero"]);
    expect(images.homeHero.mobileAlternative).toBe(true);
    expect(images.aboutHero.mobileAlternative).toBe(false);
  });

  it("keeps the Tamil-authentic portal image at its verified portrait dimensions", () => {
    expect(images.portalAuthHero).toMatchObject({
      path: "/images/tamil-ulagam/portal/portal-auth-hero-tamil.png",
      width: 1122,
      height: 1402,
      aspectRatio: "1122/1402",
      objectPosition: "50% 50%",
      available: true,
    });
  });

  it("keeps every major homepage editorial asset available", () => {
    expect(homepageEditorialImageKeys).toEqual([
      "finalCallToAction",
      "pillarConnect",
      "pillarEmpower",
      "pillarPreserve",
      "initiativeHealthcare",
      "initiativeEducation",
      "initiativeBusiness",
      "initiativeJobs",
      "globalChapters",
    ]);

    for (const key of homepageEditorialImageKeys) {
      const asset = images[key];
      const assetFile = path.join(
        process.cwd(),
        "public",
        asset.path.replace(/^\//, ""),
      );

      expect(asset.available, key).toBe(true);
      expect(existsSync(assetFile), asset.path).toBe(true);
    }
  });
});
