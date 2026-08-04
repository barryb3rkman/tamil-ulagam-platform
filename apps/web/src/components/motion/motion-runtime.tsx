"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const revealSelector = "[data-motion-reveal], [data-motion-group]";

const standardRevealFrames: Keyframe[] = [
  { opacity: 0.01, transform: "translate3d(0, 20px, 0)" },
  { opacity: 1, transform: "translate3d(0, 0, 0)" },
];

const groupRevealFrames: Keyframe[] = [
  { opacity: 0.01, transform: "translate3d(0, 14px, 0)" },
  { opacity: 1, transform: "translate3d(0, 0, 0)" },
];

export function MotionRuntime() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const supportsMotion =
      "IntersectionObserver" in window &&
      typeof Element.prototype.animate === "function";
    let revealObserver: IntersectionObserver | undefined;
    let phaseObserver: IntersectionObserver | undefined;
    let animationFrame: number | undefined;
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
            duration: 420,
            delay: desktopStagger && isGroup ? Math.min(index, 3) * 55 : 0,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
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

    const setupPhaseTracking = () => {
      window.removeEventListener("scroll", setupPhaseTracking);
      const phases = Array.from(
        document.querySelectorAll<HTMLElement>("[data-roadmap-phase]"),
      );

      if (phases.length === 0 || !("IntersectionObserver" in window)) {
        return;
      }

      const visibility = new Map<Element, number>();
      phaseObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            visibility.set(entry.target, entry.intersectionRatio);
          });

          const firstPhase = phases[0];
          if (!firstPhase) return;

          const activePhase = phases.reduce((current, phase) =>
            (visibility.get(phase) ?? 0) > (visibility.get(current) ?? 0)
              ? phase
              : current,
          );

          if ((visibility.get(activePhase) ?? 0) > 0) {
            phases.forEach((phase) => {
              if (phase === activePhase) {
                phase.setAttribute("data-roadmap-active", "true");
              } else {
                phase.removeAttribute("data-roadmap-active");
              }
            });
          }
        },
        {
          rootMargin: "-20% 0px -45% 0px",
          threshold: [0, 0.15, 0.35, 0.6],
        },
      );

      phases.forEach((phase) => phaseObserver?.observe(phase));
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
          { opacity: 0, transform: "translate3d(0, 10px, 0)" },
          { opacity: 1, transform: "translate3d(0, 0, 0)" },
        ],
        {
          duration: 420,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
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
          rootMargin: "0px 0px -10% 0px",
          threshold: 0,
        },
      );

      root.dataset.motionPreference = "standard";
      root.classList.add("motion-ready");
      updateObserverCount();
      targets.forEach((target) => revealObserver?.observe(target));

      if (document.querySelector("[data-roadmap-phase]")) {
        window.addEventListener("scroll", setupPhaseTracking, {
          once: true,
          passive: true,
        });
      }
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
        phaseObserver?.disconnect();
        activeAnimations.forEach((animation) => animation.cancel());
        activeAnimations.clear();
        remainingTargets = 0;
        updateObserverCount();
      }
    };

    reducedMotion.addEventListener("change", handleMotionPreference);

    return () => {
      revealObserver?.disconnect();
      phaseObserver?.disconnect();
      activeAnimations.forEach((animation) => animation.cancel());
      window.removeEventListener("load", scheduleInitialization);
      window.removeEventListener("scroll", setupPhaseTracking);
      window.cancelAnimationFrame(animationFrame ?? 0);
      reducedMotion.removeEventListener("change", handleMotionPreference);
      root.dataset.motionObserverCount = "0";
    };
  }, [pathname]);

  return null;
}
