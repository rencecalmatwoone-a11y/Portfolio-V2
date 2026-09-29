import { ProjectCard } from "@/components/projects/ProjectCard";
import { featuredProjects } from "@/data/projects";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import styles from "./SelectedWork.module.css";

export function SelectedWork() {
  return (
    <section id="work" className="page-section" aria-labelledby="projects-heading">
      <header className={`section-heading ${styles.header}`}>
        <h2 id="projects-heading">Projects</h2>
        <p>A selection of interfaces and websites I’ve designed and built.</p>
      </header>
      <div className={styles.grid}>
        {featuredProjects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
      <div className={styles.actionRow}>
        <Link href="/work" className={styles.viewAll}>
          View All <ArrowUpRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
