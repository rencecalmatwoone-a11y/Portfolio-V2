"use client";

import { useEffect, useState } from "react";
import { navigation, type SectionId } from "@/data/navigation";

export function useActiveSection(pathname: string) {
  const [active, setActive] = useState<SectionId | null>(null);

  useEffect(() => {
    if (pathname !== "/") return;
    const sections = navigation.flatMap(({ id }) => {
      const element = document.getElementById(id);
      return element ? [{ id, element }] : [];
    });
    const update = () => {
      // Read in document order so tall sections and reverse scrolling agree.
      const atEnd = window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
      const current = atEnd ? sections.at(-1) : sections.filter(({ element }) => element.getBoundingClientRect().top <= window.innerHeight * 0.35).at(-1);
      setActive(window.scrollY < 8 ? null : current?.id ?? null);
    };
    const observer = new IntersectionObserver(update, {
      rootMargin: "-15% 0px -65% 0px",
      threshold: [0, 1],
    });
    sections.forEach(({ element }) => observer.observe(element));
    // The final section can be too short to reach the activation band.
    const endObserver = new IntersectionObserver(update, { threshold: [0, 1] });
    const end = document.getElementById("index-page-end");
    if (end) endObserver.observe(end);
    window.addEventListener("resize", update);
    window.addEventListener("hashchange", update);
    update();
    return () => {
      observer.disconnect();
      endObserver.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("hashchange", update);
    };
  }, [pathname]);

  return pathname === "/" ? active : null;
}
