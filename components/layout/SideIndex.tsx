"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useMemo } from "react";
import { navigation, projectNavigation } from "@/data/navigation";
import { projects } from "@/data/projects";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { BackToTop } from "./BackToTop";
import { IndexLinks } from "./IndexLinks";
import { useActiveSection } from "./useActiveSection";
import styles from "./Index.module.css";

export function SideIndex() {
  const pathname = usePathname();
  const project = projects.find(({ slug }) => pathname === `/work/${slug}`);
  const items = useMemo(() => project ? projectNavigation(project) : navigation, [project]);
  const active = useActiveSection(pathname, items, pathname === "/" || !!project);

  return (
    <nav className={`${styles.desktop}${project ? ` ${styles.project}` : ""}`} aria-label={project ? "Project index" : "Section index"}>
      <p className={styles.label}>{project ? "Project" : ""}</p>
      <IndexLinks active={active} pathname={pathname} items={items} local={pathname === "/" || !!project} />
      {project && <Link href="/#work" className={styles.back}>← Projects</Link>}
      <div className={styles.actions}>
        <ThemeToggle />
        <BackToTop />
      </div>
    </nav>
  );
}
