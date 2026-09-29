"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import styles from "./BackToTop.module.css";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const pageEnd = document.getElementById("index-page-end");
    if (!pageEnd) return;

    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
    });
    observer.observe(pageEnd);
    return () => observer.disconnect();
  }, []);

  if (!visible) return null;

  return (
    <button
      className={`${styles.button} keycap`}
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({
        top: 0,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      })}
    >
      <span>Back to top</span>
      <ArrowUp size={12} aria-hidden="true" />
    </button>
  );
}
