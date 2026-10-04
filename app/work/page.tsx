import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import { projects } from "@/data/projects";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Projects",
  description: "A collection of interfaces, utilities, and web applications designed and built by JohnMark Clarence Mendoza.",
};

export default function WorkPage() {
  return (
    <main className={`page-grid ${styles.page}`}>
      <header className={styles.header}>
        <Link href="/#work" className={styles.mobileHome}><ArrowLeft size={16} aria-hidden="true" /><span>Projects</span></Link>
        <h1>Projects</h1>
        <p className={styles.intro}>
          A collection of interfaces, utilities, and web applications I’ve designed, developed, and helped shape.
        </p>
      </header>

      <section id="all-work" className={styles.projects} aria-label="All projects">
        {projects.map((project) => {
          const content = (
            <>
              <div className={styles.imageFrame}>
                <Image
                  src={project.image.src}
                  alt={project.image.alt}
                  width={project.image.width}
                  height={project.image.height}
                  priority={project.order === 1}
                  sizes="(min-width: 72rem) 34rem, (min-width: 48rem) calc((100vw - 8rem) / 2), 100vw"
                  className={styles.image}
                />
              </div>
              <div className={styles.details}>
                <div className={styles.titleRow}>
                  <h2 id={`${project.slug}-title`}>{project.title}</h2>
                  {project.status && <span className={styles.status}>{project.status}</span>}
                  {project.status !== "Ongoing" && <ArrowUpRight className={styles.arrow} size={17} aria-hidden="true" />}
                </div>
                <p id={`${project.slug}-description`} className={styles.description}>{project.description}</p>
                <p className={styles.metadata}>{project.role ?? project.category}</p>
              </div>
            </>
          );

          return (
            <article key={project.slug} className={styles.project}>
              {project.status === "Ongoing" ? (
                <div className={styles.projectLink}>{content}</div>
              ) : (
                <Link
                  href={`/work/${project.slug}`}
                  className={styles.projectLink}
                  aria-labelledby={`${project.slug}-title ${project.slug}-description`}
                >
                  {content}
                </Link>
              )}
            </article>
          );
        })}
      </section>
    </main>
  );
}
