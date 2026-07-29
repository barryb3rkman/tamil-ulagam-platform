import { expect, type Page } from "@playwright/test";

import {
  homepageEditorialImageKeys,
  images,
  type ImageKey,
} from "@/config/images";

interface ImageDiagnostic {
  readonly complete: boolean;
  readonly display: string;
  readonly height: number;
  readonly naturalHeight: number;
  readonly naturalWidth: number;
  readonly opacity: string;
  readonly parentHeight: number;
  readonly parentWidth: number;
  readonly src: string;
  readonly visibility: string;
  readonly width: number;
}

export async function scrollThroughPage(
  page: Page,
  imageKeys: readonly ImageKey[],
) {
  const viewportHeight = page.viewportSize()?.height ?? 800;
  let currentPosition = 0;
  let previousDocumentHeight = 0;

  for (let step = 0; step < 80; step += 1) {
    const documentHeight = await page.evaluate(
      () => document.documentElement.scrollHeight,
    );
    const maximumPosition = Math.max(0, documentHeight - viewportHeight);

    await page.evaluate((position) => {
      window.scrollTo({ top: position, behavior: "auto" });
    }, currentPosition);
    await page.waitForTimeout(140);
    await waitForNearbyEditorialImages(page, imageKeys, viewportHeight);

    if (currentPosition >= maximumPosition) {
      if (documentHeight === previousDocumentHeight) {
        break;
      }
      previousDocumentHeight = documentHeight;
    }

    currentPosition = Math.min(
      currentPosition + viewportHeight,
      maximumPosition,
    );
  }

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "auto" }));
  await page.waitForTimeout(180);
}

export async function scrollThroughHomepage(page: Page) {
  await scrollThroughPage(page, homepageEditorialImageKeys);
}

async function waitForNearbyEditorialImages(
  page: Page,
  imageKeys: readonly ImageKey[],
  viewportHeight: number,
) {
  for (const key of imageKeys) {
    const asset = images[key];
    const image = page.getByRole("img", { name: asset.alt });
    const isNearViewport = await image.evaluate((element, height) => {
      const { bottom, top } = element.getBoundingClientRect();

      return top < height + 320 && bottom > -320;
    }, viewportHeight);

    if (!isNearViewport) {
      continue;
    }

    await expect
      .poll(
        () =>
          image.evaluate((element) => {
            const htmlImage = element as HTMLImageElement;

            return htmlImage.complete && htmlImage.naturalWidth > 0;
          }),
        { message: `${key} did not decode while it was in view` },
      )
      .toBe(true);
  }
}

async function inspectImage(
  page: Page,
  key: ImageKey,
): Promise<ImageDiagnostic> {
  const asset = images[key];
  const image = page.getByRole("img", { name: asset.alt });

  await expect(image, `${key} should render exactly once`).toHaveCount(1);

  return image.evaluate((element) => {
    const htmlImage = element as HTMLImageElement;
    const imageStyles = window.getComputedStyle(htmlImage);
    const imageRect = htmlImage.getBoundingClientRect();
    const parentRect = htmlImage.parentElement?.getBoundingClientRect();

    return {
      complete: htmlImage.complete,
      display: imageStyles.display,
      height: imageRect.height,
      naturalHeight: htmlImage.naturalHeight,
      naturalWidth: htmlImage.naturalWidth,
      opacity: imageStyles.opacity,
      parentHeight: parentRect?.height ?? 0,
      parentWidth: parentRect?.width ?? 0,
      src: htmlImage.currentSrc || htmlImage.src,
      visibility: imageStyles.visibility,
      width: imageRect.width,
    };
  });
}

export async function verifyPageImages(
  page: Page,
  imageKeys: readonly ImageKey[],
) {
  for (const key of imageKeys) {
    const diagnostic = await inspectImage(page, key);

    expect(diagnostic.complete, `${key} did not complete loading`).toBe(true);
    expect(
      diagnostic.naturalWidth,
      `${key} has no decoded image width`,
    ).toBeGreaterThan(0);
    expect(
      diagnostic.naturalHeight,
      `${key} has no decoded image height`,
    ).toBeGreaterThan(0);
    expect(diagnostic.display, `${key} is display:none`).not.toBe("none");
    expect(diagnostic.visibility, `${key} is hidden`).not.toBe("hidden");
    expect(Number(diagnostic.opacity), `${key} is transparent`).toBeGreaterThan(
      0,
    );
    expect(diagnostic.width, `${key} has no rendered width`).toBeGreaterThan(0);
    expect(diagnostic.height, `${key} has no rendered height`).toBeGreaterThan(
      0,
    );
    expect(
      diagnostic.parentWidth,
      `${key} parent has no width`,
    ).toBeGreaterThan(0);
    expect(
      diagnostic.parentHeight,
      `${key} parent has no height`,
    ).toBeGreaterThan(0);
    expect(diagnostic.src, `${key} has no resolved source`).toContain(
      "/_next/image",
    );
  }
}

export async function verifyMajorHomepageImages(page: Page) {
  await verifyPageImages(page, homepageEditorialImageKeys);
}
