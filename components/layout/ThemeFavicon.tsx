"use client";

import { useEffect } from "react";
import { profile } from "@/data/profile";

export function ThemeFavicon() {
  useEffect(() => {
    const updateFavicon = () => {
      const isDark = document.documentElement.dataset.theme === "dark";
      document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]').forEach((icon) => {
        icon.href = isDark ? profile.portrait.darkSrc : profile.portrait.src;
      });
    };

    updateFavicon();
    window.addEventListener("themechange", updateFavicon);
    return () => window.removeEventListener("themechange", updateFavicon);
  }, []);

  return null;
}
