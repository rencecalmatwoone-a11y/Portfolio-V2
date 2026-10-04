"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

/** Ease wheel input while retaining native touch, keyboard, and anchor scrolling. */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | undefined;

    function interruptWheelScroll() {
      if (lenis?.isScrolling === "smooth") {
        lenis.scrollTo(lenis.actualScroll, { immediate: true });
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) {
        interruptWheelScroll();
      }
    }

    function syncMotionPreference() {
      lenis?.destroy();
      lenis = undefined;
      if (motion.matches) return;

      lenis = new Lenis({
        autoRaf: true,
        // Finish with zero velocity instead of lingering on the last few pixels.
        lerp: 0,
        duration: 0.85,
        easing: (progress: number) => 1 - Math.pow(1 - progress, 4),
        smoothWheel: true,
        syncTouch: false,
        allowNestedScroll: true,
        stopInertiaOnNavigate: true,
      });
    }

    syncMotionPreference();
    motion.addEventListener("change", syncMotionPreference);
    // Let native link/button navigation and keyboard input take over mid-glide.
    document.addEventListener("click", interruptWheelScroll, true);
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      motion.removeEventListener("change", syncMotionPreference);
      document.removeEventListener("click", interruptWheelScroll, true);
      document.removeEventListener("keydown", onKeyDown, true);
      lenis?.destroy();
    };
  }, [pathname]);

  return null;
}
