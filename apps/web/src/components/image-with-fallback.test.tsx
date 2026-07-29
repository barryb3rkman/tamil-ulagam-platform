import { ImageWithFallback } from "@tamil-ulagam/ui";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { images } from "@/config/images";

describe("ImageWithFallback", () => {
  it("uses the mobile hero source below the responsive breakpoint", () => {
    const { container } = render(
      <ImageWithFallback asset={images.homeHero} sizes="100vw" />,
    );

    const image = screen.getByRole("img", { name: images.homeHero.alt });
    const source = container.querySelector("picture source");

    expect(source).toHaveAttribute("media", "(max-width: 639px)");
    expect(source?.getAttribute("srcset")).toContain("home-hero-mobile.png");
    expect(image.getAttribute("src")).toContain("home-hero-desktop.png");
    expect(image).toHaveAttribute("loading", "eager");
  });

  it("keeps a lower-page asset lazy loaded", () => {
    render(
      <ImageWithFallback
        asset={images.whyTamilUlagam}
        sizes="(min-width: 48rem) 50vw, 100vw"
      />,
    );

    expect(
      screen.getByRole("img", { name: images.whyTamilUlagam.alt }),
    ).toHaveAttribute("loading", "lazy");
  });
});
