import Image from "next/image";
import type { CSSProperties } from "react";
import styles from "./CinematicBanner.module.css";

const lightImage = "/images/bg/Bmw orange.png";
const darkImage = "/images/bg/White Supercar in a Blossom Meadow.png";
const imageSizes = "(max-width: 767px) 100vw, 784px";
const petals = Array.from({ length: 56 }, (_, index) => ({
  "--petal-left": `${(index * 37 + 7) % 100}%`,
  "--petal-size": `${(index % 5 === 0 ? 11 : 5) + (index * 7) % 6}px`,
  "--petal-duration": `${index % 5 === 0 ? 8 + index % 4 : 11 + (index * 5) % 7}s`,
  "--petal-delay": `${-((index * 3.7) % 18)}s`,
  "--petal-drift": `${(index % 2 === 0 ? 1 : -1) * (18 + (index * 11) % 44)}px`,
  "--petal-flutter": `${2.8 + (index % 5) * 0.55}s`,
  "--petal-opacity": index % 5 === 0 ? 0.88 : 0.6 + (index % 4) * 0.1,
}) as CSSProperties);

export function CinematicBanner() {
  return (
    <section className={styles.section} aria-label="A quiet drive">
      <div className={styles.scene}>
        <div className={styles.lightScene} data-car-scene="light">
          <Image
            className={styles.photo}
            src={lightImage}
            alt="An orange car resting in tall grass beneath a sunset sky"
            fill
            sizes={imageSizes}
          />

          <div className={`${styles.grass} ${styles.midgrass}`} aria-hidden="true">
            <Image src={lightImage} alt="" fill sizes={imageSizes} />
          </div>
          <div className={`${styles.grass} ${styles.foregrass}`} aria-hidden="true">
            <Image src={lightImage} alt="" fill sizes={imageSizes} />
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

        <div className={styles.darkScene} data-car-scene="dark">
          <Image
            className={`${styles.photo} ${styles.blossomPhoto}`}
            src={darkImage}
            alt="A white Ferrari parked in a meadow surrounded by pink blossom trees"
            fill
            sizes={imageSizes}
            loading="eager"
          />
          <div
            className={`${styles.cornerBlossoms} ${styles.cornerBlossomsLeft}`}
            data-corner-blossoms="left"
            aria-hidden="true"
          >
            <Image
              className={`${styles.photo} ${styles.blossomPhoto}`}
              src={darkImage}
              alt=""
              fill
              sizes={imageSizes}
            />
          </div>
          <div
            className={`${styles.cornerBlossoms} ${styles.cornerBlossomsRight}`}
            data-corner-blossoms="right"
            aria-hidden="true"
          >
            <Image
              className={`${styles.photo} ${styles.blossomPhoto}`}
              src={darkImage}
              alt=""
              fill
              sizes={imageSizes}
            />
          </div>
          <div className={styles.petals} data-petals aria-hidden="true">
            {petals.map((style, index) => (
              <span className={styles.petalFall} data-petal key={index} style={style}>
                <span className={styles.petal} />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
