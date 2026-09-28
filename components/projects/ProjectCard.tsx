import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, PanelsTopLeft, Pin } from "lucide-react";
import { projectToolIcons } from "@/data/project-tools";
import type { Project } from "@/types/project";
import styles from "./ProjectCard.module.css";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className={styles.card}>
      <Link
        href={`/work/${project.slug}`}
        className={styles.link}
        aria-labelledby={`${project.slug}-title ${project.slug}-action`}
      >
        <div className={styles.imageFrame}>
          {project.order === 1 && <span className={styles.pin} title="Featured project"><Pin size={12} aria-label="Featured project" /></span>}
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
              {project.technologies.slice(0, 3).map((technology) => (
                <li key={technology} title={technology}>
                  {projectToolIcons[technology] ? (
                    <Image src={projectToolIcons[technology]} alt={technology} width={14} height={14} className={styles.toolIcon} />
                  ) : technology === "Wireframing" ? (
                    <PanelsTopLeft size={14} role="img" aria-label={technology} />
                  ) : technology}
                </li>
              ))}
            </ul>
            <span id={`${project.slug}-action`} className={styles.action}>
              View Project <ArrowUpRight size={12} aria-hidden="true" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
