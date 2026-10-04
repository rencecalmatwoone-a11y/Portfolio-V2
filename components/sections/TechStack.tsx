import { TechStackFilter } from "./TechStackFilter";
import styles from "./TechStack.module.css";

export function TechStack() {
  return (
    <section id="stack" className="page-section" aria-labelledby="skills-heading">
      <header className={`section-heading ${styles.header}`} data-hover-area>
        <h2 id="skills-heading">Tech Stack</h2>
      </header>
      <TechStackFilter />
    </section>
  );
}
