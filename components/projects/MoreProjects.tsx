"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Project } from "@/types/project";
import styles from "./MoreProjects.module.css";

type Preview = { project: Project; left: number; top: number; width: number; above: boolean };

export function MoreProjects({ projects }: { projects: readonly Project[] }) {
  const [preview, setPreview] = useState<Preview | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchInput = useRef(false);
  const reducedMotion = useReducedMotion();
  const id = useId();

  function cancelClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }

  function closeSoon() {
    cancelClose();
    closeTimer.current = setTimeout(() => setPreview(null), 140);
  }

  function open(project: Project, element: HTMLElement) {
    cancelClose();
    const bounds = element.getBoundingClientRect();
    const width = Math.min(320, window.innerWidth - 32);
    const height = width * 9 / 16 + 78;
    const above = bounds.top >= height + 16 || bounds.top > window.innerHeight - bounds.bottom;
    setPreview({
      project,
      width,
      left: Math.max(16, Math.min(bounds.left, window.innerWidth - width - 16)),
      top: above ? bounds.top : bounds.bottom,
      above,
    });
  }

  useEffect(() => {
    if (!preview) return;
    const dismiss = () => setPreview(null);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", dismiss);
    window.addEventListener("scroll", dismiss, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", dismiss);
      window.removeEventListener("scroll", dismiss, true);
    };
  }, [preview]);

  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

  return (
    <>
      <ul className={styles.list}>
        {projects.map((project) => (
          <li key={project.slug}>
            <Link
              href={`/work/${project.slug}`}
              aria-describedby={preview?.project.slug === project.slug ? id : undefined}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") open(project, event.currentTarget);
              }}
              onPointerLeave={closeSoon}
              onPointerDown={(event) => { touchInput.current = event.pointerType === "touch"; }}
              onKeyDown={() => { touchInput.current = false; }}
              onFocus={(event) => {
                if (!touchInput.current && event.currentTarget.matches(":focus-visible")) open(project, event.currentTarget);
              }}
              onBlur={() => { touchInput.current = false; closeSoon(); }}
              onClick={() => setPreview(null)}
            >
              <span><span className={styles.title}>{project.title}</span><span className={styles.category}>{project.category}</span></span>
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {preview && (
            <motion.div
              key={preview.project.slug}
              className={styles.positioner}
              style={{ left: preview.left, top: preview.top, width: preview.width }}
              data-above={preview.above}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, pointerEvents: "none" }}
              transition={{ duration: reducedMotion ? 0 : 0.16 }}
              onPointerEnter={cancelClose}
              onPointerLeave={closeSoon}
            >
              <div id={id} role="tooltip" className={styles.card}>
                <Image
                  src={preview.project.image.src}
                  alt={preview.project.image.alt}
                  width={preview.project.image.width}
                  height={preview.project.image.height}
                  sizes="320px"
                  className={styles.image}
                />
                <div className={styles.caption}>
                  <span className={styles.title}>{preview.project.title}</span>
                  <span className={styles.category}>{preview.project.category}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
