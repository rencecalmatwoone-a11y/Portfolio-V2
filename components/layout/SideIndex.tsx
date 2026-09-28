"use client";

import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { IndexLinks } from "./IndexLinks";
import { useActiveSection } from "./useActiveSection";
import styles from "./Index.module.css";

export function SideIndex() {
  const pathname = usePathname();
  const active = useActiveSection(pathname);

  return (
    <nav className={styles.desktop} aria-label="Section index">
      <p className={styles.label}></p>
      <IndexLinks active={active} pathname={pathname} />
      <ThemeToggle />
    </nav>
  );
}
