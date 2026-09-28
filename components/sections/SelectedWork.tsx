import { ProjectCard } from "@/components/projects/ProjectCard";
import { featuredProjects } from "@/data/projects";
import styles from "./SelectedWork.module.css";

export function SelectedWork() {
  return (
    <section id="work" className={styles.section} aria-labelledby="work-heading">
      <header className={styles.header}>
        <h2 id="work-heading">Selected Work</h2>
        <p>A selection of interfaces and products I’ve worked on.</p>
      </header>
      <div className={styles.grid}>
        {featuredProjects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </section>
  );
}
