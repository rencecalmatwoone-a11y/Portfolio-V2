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
  const archive = pathname === "/work";
  const project = archive ? undefined : projects.find(({ slug }) => pathname === `/work/${slug}`);
  const items = useMemo(() => archive
    ? [{ id: "all-work", label: "All Work" }]
    : project ? projectNavigation(project) : navigation, [archive, project]);
  const active = useActiveSection(pathname, items, archive || pathname === "/" || !!project);

  return (
    <nav className={`${styles.desktop}${project ? ` ${styles.project}` : ""}${archive ? ` ${styles.archive}` : ""}`} aria-label={archive ? "Projects index" : project ? "Project index" : "Section index"}>
      <p className={styles.label}>{archive ? "Projects" : project ? "Project" : ""}</p>
      <IndexLinks active={active} pathname={pathname} items={items} local={archive || pathname === "/" || !!project} />
      {(archive || project) && <Link href="/#work" className={styles.back}>← Projects</Link>}
      {!archive && <div className={styles.actions}>
        <ThemeToggle />
        <BackToTop />
      </div>}
    </nav>
  );
}
