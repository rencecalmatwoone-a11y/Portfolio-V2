"use client";

import { useEffect, useState } from "react";
import { navigation, type IndexItem } from "@/data/navigation";

export function useActiveSection(pathname: string, items: readonly IndexItem[] = navigation, enabled = pathname === "/") {
  const [active, setActive] = useState<{ pathname: string; id: string | null } | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const sections = items.flatMap(({ id }) => {
      const element = document.getElementById(id);
      return element ? [{ id, element }] : [];
    });
    const end = document.getElementById("index-page-end");
    const update = () => {
      // Read in document order so tall sections and reverse scrolling agree.
      const atEnd = window.scrollY > 0 && (end
        ? end.getBoundingClientRect().top <= window.innerHeight + 2
        : window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2);
      // Case-study text sections are shorter than the homepage sections.
      const activationLine = pathname === "/" ? window.innerHeight * 0.35 : Math.min(120, window.innerHeight * 0.2);
      const current = atEnd ? sections.at(-1) : sections.filter(({ element }) => element.getBoundingClientRect().top <= activationLine).at(-1);
      const id = window.scrollY < 8 ? null : current?.id ?? null;
      setActive(previous => previous?.pathname === pathname && previous.id === id ? previous : { pathname, id });
    };
    const observer = new IntersectionObserver(update, {
      rootMargin: "-15% 0px -65% 0px",
      threshold: [0, 1],
    });
    sections.forEach(({ element }) => observer.observe(element));
    // The final section can be too short to reach the activation band.
    const endObserver = new IntersectionObserver(update, { threshold: [0, 1] });
    if (end) endObserver.observe(end);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("hashchange", update);
    update();
    return () => {
      observer.disconnect();
      endObserver.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
      window.removeEventListener("hashchange", update);
    };
  }, [pathname, items, enabled]);

  return enabled && active?.pathname === pathname ? active.id : null;
}
