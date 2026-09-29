import type { MouseEvent } from "react";
import { navigation, type IndexItem } from "@/data/navigation";
import { navigationHref } from "@/lib/navigation";
import styles from "./Index.module.css";

export function IndexLinks({ active, pathname, items = navigation, local = pathname === "/" }: {
  active: string | null;
  pathname: string;
  items?: readonly IndexItem[];
  local?: boolean;
}) {
  function navigate(event: MouseEvent<HTMLAnchorElement>, id: string) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById(id);
    if (local && target) {
      target.tabIndex = -1;
      target.focus({ preventScroll: true });
    }
  }

  return (
    <ul className={styles.links}>
      {items.map(({ id, label }) => (
        <li key={id}>
          <a href={local ? `#${id}` : navigationHref(pathname, id)} aria-current={active === id ? "location" : undefined} onClick={(event) => navigate(event, id)}>
            {label}
          </a>
        </li>
      ))}
    </ul>
  );
}
