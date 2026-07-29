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

  it("prioritises only the responsive home hero", () => {
    const priorityEntries = Object.entries(images)
      .filter(([, asset]) => asset.aboveFold)
      .map(([key]) => key);

    expect(priorityEntries).toEqual(["homeHero"]);
    expect(images.homeHero.mobileAlternative).toBe(true);
  });

  it("keeps every major homepage editorial asset available", () => {
    expect(homepageEditorialImageKeys).toEqual([
      "whyTamilUlagam",
      "tamilIdShowcase",
      "globalChapters",
      "roadmapFuture",
      "mobileAppPreview",
      "partnerships",
      "communityStories",
      "finalCallToAction",
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
