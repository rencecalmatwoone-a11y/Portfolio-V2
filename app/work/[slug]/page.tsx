import { notFound, permanentRedirect } from "next/navigation";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import { ProjectVisual } from "@/components/projects/ProjectVisual";
import { MoreProjects } from "@/components/projects/MoreProjects";
import { skillIcons } from "@/data/skill-icons";
import { projects } from "@/data/projects";
import styles from "./page.module.css";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((entry) => entry.slug === slug);
  return project ? { title: project.title, description: project.description } : {};
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  if (slug === "collecthieves-tutoy-hub") permanentRedirect("/work/tutoyhub");
  const project = projects.find((entry) => entry.slug === slug);
  if (!project) notFound();

  const visuals = project.visuals ?? [];
  const reflectionPosition = Math.max(1, Math.min(2, visuals.length - 1));
  const moreProjects = projects.filter((entry) => entry.slug !== slug && entry.status !== "Ongoing").slice(0, 3);

  return (
    <main className={`page-grid ${styles.page}`}>
      <header className={`${styles.text} ${styles.hero}`}>
        {project.status === "Ongoing" && <span className={styles.status}>Ongoing</span>}
        <h1>{project.title}</h1>
        <p className={styles.description}>{project.description}</p>
        {(project.liveUrl || project.repositoryUrl) && (
          <div className={styles.actions}>
            {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">View Live <ArrowUpRight size={14} aria-hidden="true" /></a>}
            {project.repositoryUrl && <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer">Source Code <ArrowUpRight size={14} aria-hidden="true" /></a>}
          </div>
        )}
      </header>
      <ProjectVisual {...project.image} priority />
      {!!project.overview?.length && (
        <section id="overview" className={`${styles.text} ${styles.section}`} aria-labelledby="overview-heading">
          <h2 id="overview-heading" className={styles.srOnly}>Overview</h2>
          {project.overview.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </section>
      )}
      {!!project.technologies.length && (
        <section id="stack" className={`${styles.text} ${styles.section}`} aria-labelledby="stack-heading">
          <h2 id="stack-heading">Project Stack</h2>
          <ul className={styles.stack}>
            {project.technologies.filter((technology) => skillIcons[technology]).map((technology) => (
              <li key={technology} title={technology}>
                <Image src={skillIcons[technology]} alt={technology} width={20} height={20} className={styles.stackIcon} />
              </li>
            ))}
          </ul>
        </section>
      )}
      {!!visuals.length && (
        <section id="gallery" className={`${styles.section} ${styles.gallery}`} aria-labelledby="gallery-heading">
          <h2 id="gallery-heading" className={styles.srOnly}>Gallery</h2>
          {visuals.slice(0, reflectionPosition).map((visual) => <ProjectVisual key={visual.src} {...visual} />)}
          {project.reflection && <p className={`${styles.text} ${styles.reflection}`}>{project.reflection}</p>}
          {visuals.slice(reflectionPosition).map((visual) => <ProjectVisual key={visual.src} {...visual} />)}
        </section>
      )}
      {!visuals.length && project.reflection && <p className={`${styles.text} ${styles.section}`}>{project.reflection}</p>}
      {!!project.highlights?.length && (
        <section id="highlights" className={`${styles.text} ${styles.section}`} aria-labelledby="highlights-heading">
          <h2 id="highlights-heading">Highlights</h2>
          <ul className={styles.highlights}>
            {project.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
          </ul>
        </section>
      )}
      {!!moreProjects.length && (
        <section className={`${styles.text} ${styles.section}`} aria-labelledby="more-projects-heading">
          <h2 id="more-projects-heading">More Projects</h2>
          <MoreProjects projects={moreProjects} />
        </section>
      )}
    </main>
  );
}
