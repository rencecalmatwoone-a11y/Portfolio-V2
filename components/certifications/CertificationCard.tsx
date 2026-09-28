import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { Certification } from "@/data/certifications";
import styles from "./Certifications.module.css";

export function CertificationCard({ certification, index }: { certification: Certification; index: number }) {
  const artwork = certification.issuerLogo ?? certification.credentialBadge;
  const certificate = certification.certificateImage;

  return (
    <article className={styles.card} aria-labelledby={`credential-${certification.id}`}>
      <div className={styles.cardHeader}>
        <div className={styles.issuerRow}>
          {artwork && (
            <div className={styles.artwork}>
              <Image src={artwork} alt={certification.credentialBadge ? `${certification.title} badge` : ""}
                width={40} height={40} sizes="40px" draggable={false} />
            </div>
          )}
          <div>
            <p className={styles.issuer}>{certification.issuer}</p>
            <p className={styles.kind}>{certification.kind}</p>
          </div>
        </div>
        <span className={styles.index} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
      </div>
      {certificate && (
        <div className={styles.preview}>
          <Image src={certificate.src} alt={certificate.alt} width={certificate.width} height={certificate.height}
            sizes="(max-width: 639px) 80vw, 440px" className={styles.certificate} />
        </div>
      )}
      <div className={styles.cardBody}>
        <div className={styles.details}>
          <h3 id={`credential-${certification.id}`}>{certification.title}</h3>
          <p className={styles.description}>{certification.description}</p>
          {certification.skills?.length ? <p className={styles.metadata}>{certification.skills.slice(0, 4).join(" · ")}</p> : null}
          {certification.credentialId && <p className={styles.metadata}>Credential ID: {certification.credentialId}</p>}
        </div>
      </div>
      <div className={styles.cardFooter}>
        <p className={styles.metadata}>
          <span className={styles.status} data-status={certification.status}>
            {certification.status === "in-progress" ? "In Progress" : "Completed"}
          </span>
          {certification.date && <span className={styles.date}>{certification.date}</span>}
        </p>
        {certification.credentialUrl && certification.status === "completed" && (
          <a className={styles.credentialLink} href={certification.credentialUrl} target="_blank" rel="noopener noreferrer"
            aria-label={`View ${certification.title} credential from ${certification.issuer} (opens in a new tab)`}>
            View Credential <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        )}
      </div>
    </article>
  );
}
