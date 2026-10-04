import Image from "next/image";
import { education } from "@/data/education";
import styles from "./Education.module.css";

export function Education() {
  return (
    <section id="education" className="page-section" aria-labelledby="education-heading">
      <header className={`section-heading ${styles.header}`} data-hover-area>
        <h2 id="education-heading">Education</h2>
      </header>
      {education.map((entry) => (
        <article className={styles.entry} key={`${entry.institution}-${entry.degree}`}>
          <div className={styles.academic}>
            {entry.logo && (
              <Image
                className={styles.logo}
                src={entry.logo}
                alt=""
                width={36}
                height={36}
                sizes="36px"
              />
            )}
            <div className={styles.details}>
              <h3 className={styles.degree}>{entry.degree}</h3>
              <p className={styles.institution}>{entry.institution}</p>
              {entry.location && <p className={styles.location}>{entry.location}</p>}
            </div>
          </div>
          {entry.period && <p className={styles.period}>{entry.period}</p>}
          {entry.description && <p className={styles.description}>{entry.description}</p>}
        </article>
      ))}
    </section>
  );
}
