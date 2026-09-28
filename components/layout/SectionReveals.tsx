"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./SectionReveals.module.css";

/** Enhance server-rendered sections without hiding content before JavaScript loads. */
export function SectionReveals({ children }: { children: ReactNode }) {
  const mainRef = useRef<HTMLElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const veil = veilRef.current;
    const pageEnd = document.getElementById("index-page-end");
    if (!veil || !pageEnd || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(([entry]) => {
      veil.dataset.pageEnd = String(entry.isIntersecting);
    }, { rootMargin: "0px 0px 2px 0px" });
    observer.observe(pageEnd);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const main = mainRef.current;
    if (!main || !("IntersectionObserver" in window)) return;

    const sections = Array.from(main.querySelectorAll<HTMLElement>(":scope > section.page-section"));
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const animations = new Map<HTMLElement, Animation>();
    let observer: IntersectionObserver | undefined;

    function cancel(section: HTMLElement) {
      animations.get(section)?.cancel();
      animations.delete(section);
    }

    function observe() {
      observer?.disconnect();
      sections.forEach(cancel);
      if (motion.matches) return;

      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const section = entry.target as HTMLElement;
          cancel(section);
          if (!entry.isIntersecting || section.contains(document.activeElement)) return;

          const animation = section.animate([
            { opacity: 0, transform: "translateY(0.9rem)", filter: "blur(0.5px)" },
            { opacity: 1, transform: "none", filter: "blur(0px)" },
          ], { duration: 1350, easing: "cubic-bezier(0.22, 1, 0.36, 1)" });
          animations.set(section, animation);
          animation.onfinish = () => cancel(section);
        });
      }, {
        // An entry threshold also works for sections taller than a mobile viewport.
        threshold: 0,
        rootMargin: "0px 0px -10% 0px",
      });
      sections.forEach((section) => observer?.observe(section));
    }

    function revealFocusedSection(event: FocusEvent) {
      const section = sections.find((section) => section.contains(event.target as Node));
      if (section) cancel(section);
    }

    observe();
    motion.addEventListener("change", observe);
    main.addEventListener("focusin", revealFocusedSection);
    return () => {
      observer?.disconnect();
      sections.forEach(cancel);
      motion.removeEventListener("change", observe);
      main.removeEventListener("focusin", revealFocusedSection);
    };
  }, []);

  return (
    <>
      <main ref={mainRef} className="page-grid">{children}</main>
      <div ref={veilRef} className={styles.veil} aria-hidden="true" />
    </>
  );
}
