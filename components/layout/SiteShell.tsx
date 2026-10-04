import type { ReactNode } from "react";
import { SideIndex } from "./SideIndex";
import { SmoothScroll } from "./SmoothScroll";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
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
