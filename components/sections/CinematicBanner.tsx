import Image from "next/image";
import styles from "./CinematicBanner.module.css";

const image = "/images/bg/Bmw orange.png";

export function CinematicBanner() {
  return (
    <section className={styles.section} aria-label="A quiet sunset drive">
      <div className={styles.scene}>
        <Image
          className={styles.photo}
          src={image}
          alt="An orange car resting in tall grass beneath a sunset sky"
          fill
          sizes="(max-width: 767px) 100vw, 784px"
          style={{ objectFit: "cover", objectPosition: "center" }}
        />

        <div className={`${styles.grass} ${styles.midgrass}`} aria-hidden="true">
          <Image src={image} alt="" fill sizes="(max-width: 767px) 100vw, 784px" />
        </div>
        <div className={`${styles.grass} ${styles.foregrass}`} aria-hidden="true">
          <Image src={image} alt="" fill sizes="(max-width: 767px) 100vw, 784px" />
        </div>

        <span className={`${styles.headlight} ${styles.headlightLeft}`} aria-hidden="true">
          <span className={styles.headlightDim} />
          <span className={styles.headlightGlow} />
        </span>
        <span className={`${styles.headlight} ${styles.headlightRight}`} aria-hidden="true">
          <span className={styles.headlightDim} />
          <span className={styles.headlightGlow} />
        </span>
        <span className={styles.grassGlow} aria-hidden="true" />
        <span className={styles.sunsetRays} aria-hidden="true" />
      </div>
    </section>
  );
}
