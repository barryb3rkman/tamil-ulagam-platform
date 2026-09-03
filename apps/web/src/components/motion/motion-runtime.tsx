"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const revealSelector = "[data-motion-reveal], [data-motion-group]";

const standardRevealFrames: Keyframe[] = [
  { opacity: 0.55, transform: "translate3d(0, 18px, 0) scale(0.99)" },
  { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)" },
];

const groupRevealFrames: Keyframe[] = [
  { opacity: 0.5, transform: "translate3d(0, 15px, 0) scale(0.994)" },
  { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)" },
];

const snapEasing = "cubic-bezier(0.22, 1.16, 0.36, 1)";

export function MotionRuntime() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const supportsMotion =
      "IntersectionObserver" in window &&
      typeof Element.prototype.animate === "function";
    let revealObserver: IntersectionObserver | undefined;
    let ruleObserver: IntersectionObserver | undefined;
    let animationFrame: number | undefined;
    let spineFrame: number | undefined;
    let detachSpines: (() => void) | undefined;
    let remainingTargets = 0;
    const activeAnimations = new Set<Animation>();

    const updateObserverCount = () => {
      root.dataset.motionObserverCount = remainingTargets > 0 ? "1" : "0";
    };

    const playReveal = (target: HTMLElement) => {
      const isGroup = target.hasAttribute("data-motion-group");
      const elements = isGroup
        ? Array.from(target.children).filter(
            (element): element is HTMLElement => element instanceof HTMLElement,
          )
        : [target];
      const desktopStagger = window.innerWidth >= 768;

      const animations = elements.map((element, index) => {
        const animation = element.animate(
          isGroup ? groupRevealFrames : standardRevealFrames,
          {
            duration: 400,
            delay: desktopStagger && isGroup ? Math.min(index, 7) * 45 : 0,
            easing: snapEasing,
            fill: "both",
          },
        );
        activeAnimations.add(animation);
        return animation;
      });

      void Promise.all(animations.map((animation) => animation.finished))
        .then(() => {
          target.dataset.motionComplete = "true";
          animations.forEach((animation) => {
            activeAnimations.delete(animation);
            animation.cancel();
          });
        })
        .catch(() => undefined);

      revealObserver?.unobserve(target);
      remainingTargets = Math.max(0, remainingTargets - 1);
      updateObserverCount();
    };

    const setupSpines = () => {
      const spines = Array.from(
        document.querySelectorAll<HTMLElement>("[data-spine]"),
      );
      if (spines.length === 0) return;

      const paint = () => {
        spineFrame = undefined;
        const viewport = window.innerHeight;
        for (const spine of spines) {
          const box = spine.getBoundingClientRect();
          const from = viewport * 0.78;
          const to = viewport * 0.45;
          const travelled = from - box.top;
          const span = Math.max(1, box.height + (from - to));
          const progress = Math.min(1, Math.max(0, travelled / span));
          spine.style.setProperty("--spine-progress", progress.toFixed(4));

          const nodes = Array.from(
            spine.querySelectorAll<HTMLElement>("[data-spine-node]"),
          );
          for (const node of nodes) {
            const nodeBox = node.getBoundingClientRect();
            const nodeCentre = nodeBox.top + nodeBox.height / 2;
            const reached =
              (nodeCentre - box.top) / Math.max(1, box.height) <= progress;
            if (reached) node.dataset.spineReached = "true";
            else delete node.dataset.spineReached;
          }
        }
      };

      const onScroll = () => {
        if (spineFrame !== undefined) return;
        spineFrame = window.requestAnimationFrame(paint);
      };

      paint();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      detachSpines = () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      };
    };

    const setupRules = () => {
      const rules = Array.from(
        document.querySelectorAll<HTMLElement>("[data-motion-draw]"),
      );
      if (rules.length === 0 || !("IntersectionObserver" in window)) return;
      ruleObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const rule = entry.target as HTMLElement;
            const animation = rule.animate(
              [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
              { duration: 560, easing: snapEasing, fill: "both" },
            );
            activeAnimations.add(animation);
            void animation.finished
              .then(() => {
                rule.dataset.motionComplete = "true";
                activeAnimations.delete(animation);
                animation.cancel();
              })
              .catch(() => undefined);
            ruleObserver?.unobserve(rule);
          }
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0 },
      );
      rules.forEach((rule) => ruleObserver?.observe(rule));
    };

    const initialize = () => {
      if (reducedMotion.matches) {
        root.dataset.motionPreference = "reduced";
        root.dataset.motionObserverCount = "0";
        root.classList.add("motion-ready");
        return;
      }

      if (!supportsMotion) {
        root.dataset.motionPreference = "unsupported";
        root.dataset.motionObserverCount = "0";
        root.classList.remove("motion-ready");
        return;
      }

      const route = document.querySelector<HTMLElement>(
        "[data-route-transition]",
      );
      const routeAnimation = route?.animate(
        [
          { opacity: 0.97, transform: "translate3d(0, 4px, 0)" },
          { opacity: 1, transform: "translate3d(0, 0, 0)" },
        ],
        {
          duration: 200,
          easing: snapEasing,
          fill: "both",
        },
      );
      if (routeAnimation) activeAnimations.add(routeAnimation);
      void routeAnimation?.finished
        .then(() => {
          activeAnimations.delete(routeAnimation);
          routeAnimation.cancel();
        })
        .catch(() => undefined);

      const targets = Array.from(
        document.querySelectorAll<HTMLElement>(revealSelector),
      ).filter((target) => getComputedStyle(target).display !== "none");

      remainingTargets = targets.length;
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              playReveal(entry.target as HTMLElement);
            }
          });
        },
        {
          rootMargin: "0px 0px -4% 0px",
          threshold: 0,
        },
      );

      root.dataset.motionPreference = "standard";
      root.classList.add("motion-ready");
      updateObserverCount();
      targets.forEach((target) => revealObserver?.observe(target));

      setupSpines();
      setupRules();
    };

    const scheduleInitialization = () => {
      animationFrame = window.requestAnimationFrame(initialize);
    };

    if (document.readyState === "complete") {
      scheduleInitialization();
    } else {
      window.addEventListener("load", scheduleInitialization, { once: true });
    }

    const handleMotionPreference = (event: MediaQueryListEvent) => {
      if (event.matches) {
        root.dataset.motionPreference = "reduced";
        revealObserver?.disconnect();
        ruleObserver?.disconnect();
        detachSpines?.();
        activeAnimations.forEach((animation) => animation.cancel());
        activeAnimations.clear();
        remainingTargets = 0;
        updateObserverCount();
      }
    };

    reducedMotion.addEventListener("change", handleMotionPreference);

    return () => {
      revealObserver?.disconnect();
      ruleObserver?.disconnect();
      detachSpines?.();
      activeAnimations.forEach((animation) => animation.cancel());
      window.removeEventListener("load", scheduleInitialization);
      window.cancelAnimationFrame(animationFrame ?? 0);
      if (spineFrame !== undefined) window.cancelAnimationFrame(spineFrame);
      reducedMotion.removeEventListener("change", handleMotionPreference);
      root.dataset.motionObserverCount = "0";
    };
  }, [pathname]);

  return null;
}
