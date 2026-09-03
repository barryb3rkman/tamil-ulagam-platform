import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MotionRuntime } from "./motion-runtime";

vi.mock("next/navigation", () => ({
  usePathname: () => "/test-route",
}));

type ObserverCallback = ConstructorParameters<typeof IntersectionObserver>[0];

class TestIntersectionObserver {
  static instances: TestIntersectionObserver[] = [];

  readonly disconnect = vi.fn();
  readonly observe = vi.fn();
  readonly unobserve = vi.fn();

  constructor(readonly callback: ObserverCallback) {
    TestIntersectionObserver.instances.push(this);
  }
}

function setMotionPreference(reduced: boolean) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation(() => ({
      matches: reduced,
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe("MotionRuntime", () => {
  beforeEach(() => {
    TestIntersectionObserver.instances = [];
    Object.defineProperty(globalThis, "IntersectionObserver", {
      configurable: true,
      value: TestIntersectionObserver,
    });
    Object.defineProperty(window, "requestAnimationFrame", {
      configurable: true,
      value: (callback: FrameRequestCallback) => {
        callback(0);
        return 1;
      },
    });
    Object.defineProperty(window, "cancelAnimationFrame", {
      configurable: true,
      value: vi.fn(),
    });
    Object.defineProperty(Element.prototype, "animate", {
      configurable: true,
      value: vi.fn().mockReturnValue({
        cancel: vi.fn(),
        finished: new Promise(() => undefined),
      }),
    });
    setMotionPreference(false);
  });

  afterEach(() => {
    document.documentElement.classList.remove("motion-ready");
    delete document.documentElement.dataset.motionObserverCount;
    delete document.documentElement.dataset.motionPreference;
    vi.restoreAllMocks();
  });

  it("keeps content in the document and reveals observed sections once", () => {
    render(
      <>
        <MotionRuntime />
        <section data-motion-reveal="section">
          <h2>Community section</h2>
        </section>
      </>,
    );

    const heading = screen.getByRole("heading", { name: "Community section" });
    const section = heading.closest("section");
    const observer = TestIntersectionObserver.instances[0];

    expect(heading).toBeInTheDocument();
    expect(observer?.observe).toHaveBeenCalledWith(section);

    act(() => {
      observer?.callback(
        [
          {
            isIntersecting: true,
            target: section,
          } as unknown as IntersectionObserverEntry,
        ],
        observer as unknown as IntersectionObserver,
      );
    });

    expect(Element.prototype.animate).toHaveBeenCalledOnce();
    expect(observer?.unobserve).toHaveBeenCalledWith(section);
  });

  it("reveals everything immediately when reduced motion is requested", () => {
    setMotionPreference(true);

    render(
      <>
        <MotionRuntime />
        <section data-motion-reveal="section">Reduced motion content</section>
      </>,
    );

    expect(screen.getByText("Reduced motion content")).toBeInTheDocument();
    expect(document.documentElement.dataset.motionPreference).toBe("reduced");
    expect(TestIntersectionObserver.instances).toHaveLength(0);
  });

  it("disconnects its observer during cleanup", () => {
    const view = render(
      <>
        <MotionRuntime />
        <section data-motion-reveal="section">Observed content</section>
      </>,
    );
    const observer = TestIntersectionObserver.instances[0];

    view.unmount();

    expect(observer?.disconnect).toHaveBeenCalledOnce();
    expect(document.documentElement.dataset.motionObserverCount).toBe("0");
  });
});
