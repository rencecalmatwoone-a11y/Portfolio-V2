import { CertificationCard } from "@/components/certifications/CertificationCard";
import { CertificationCarousel } from "@/components/certifications/CertificationCarousel";
import { certifications } from "@/data/certifications";
import styles from "@/components/certifications/Certifications.module.css";

export function Certifications() {
  if (certifications.length === 0) return null;

  return (
    <section id="certifications" className="page-section" aria-labelledby="certifications-heading">
      <header className={`section-heading ${styles.header}`}>
        <h2 id="certifications-heading">Certifications</h2>
        <p>Selected credentials supporting my work in technology and development.</p>
      </header>
      <CertificationCarousel titles={certifications.map(({ title }) => title)}>
        {certifications.map((certification, index) => (
          <CertificationCard key={certification.id} certification={certification} index={index} />
        ))}
      </CertificationCarousel>
    </section>
  );
}
