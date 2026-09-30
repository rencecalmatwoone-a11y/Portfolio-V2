import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { projectToolIcons } from "@/data/project-tools";
import type { Project } from "@/types/project";
import styles from "./ProjectCard.module.css";

export function ProjectCard({ project }: { project: Project }) {
  const content = (
    <>
      <div className={styles.imageFrame}>
        <Image
          data-project-image
          src={project.image.src}
          alt={project.image.alt}
          width={project.image.width}
          height={project.image.height}
          sizes="(min-width: 896px) 296px, (min-width: 800px) 618px, (min-width: 500px) 78vw, 75vw"
          loading="lazy"
          className={styles.image}
        />
      </div>
      <div className={styles.body}>
        <div className={styles.titleRow}>
          <h3 id={`${project.slug}-title`} className={styles.title}>{project.title}</h3>
          {project.status && <span className={styles.status}><span aria-hidden="true" />{project.status}</span>}
        </div>
        <p className={styles.description}>{project.description}</p>
        <div className={styles.footer}>
          <ul className={styles.stack} aria-label={`${project.title} tools and technologies`}>
            {project.technologies.filter((technology) => projectToolIcons[technology]).slice(0, 3).map((technology) => (
              <li key={technology} title={technology}>
                <Image src={projectToolIcons[technology]} alt={technology} width={14} height={14} className={styles.toolIcon} />
              </li>
            ))}
          </ul>
          {project.status !== "Ongoing" && (
            <span id={`${project.slug}-action`} className={styles.action}>
              View Project <ArrowUpRight size={12} aria-hidden="true" />
            </span>
          )}
        </div>
      </div>
    </>
  );

  return (
    <article className={styles.card}>
      {project.status === "Ongoing" ? (
        <div className={styles.link}>{content}</div>
      ) : (
        <Link
          href={`/work/${project.slug}`}
          className={styles.link}
          aria-labelledby={`${project.slug}-title ${project.slug}-action`}
        >
          {content}
        </Link>
      )}
    </article>
  );
}
