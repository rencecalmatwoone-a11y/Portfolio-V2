import type { ReactNode } from "react";
import { SideIndex } from "./SideIndex";
import { SmoothScroll } from "./SmoothScroll";
import { ThemeFavicon } from "./ThemeFavicon";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <ThemeFavicon />
      <SmoothScroll />
      <a className="skip-link" href="#main-content">Skip to content</a>
      <SideIndex />
      <div className="site-content" id="main-content" tabIndex={-1}>
        {children}
        <div id="index-page-end" aria-hidden="true" />
      </div>
    </>
  );
}
