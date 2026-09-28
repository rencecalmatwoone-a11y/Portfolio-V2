import type { MouseEvent } from "react";
import { navigation, type SectionId } from "@/data/navigation";
import { navigationHref } from "@/lib/navigation";
import styles from "./Index.module.css";

export function IndexLinks({ active, pathname }: {
  active: SectionId | null;
  pathname: string;
}) {
  function navigate(event: MouseEvent<HTMLAnchorElement>, id: string) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById(id);
    if (pathname === "/" && target) {
      target.tabIndex = -1;
      target.focus({ preventScroll: true });
    }
  }

  return (
    <ul className={styles.links}>
      {navigation.map(({ id, label }) => (
        <li key={id}>
          <a href={navigationHref(pathname, id)} aria-current={active === id ? "location" : undefined} onClick={(event) => navigate(event, id)}>
            {label}
          </a>
        </li>
      ))}
    </ul>
  );
}
