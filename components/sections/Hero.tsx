import Image from "next/image";
import { hero } from "@/data/hero";
import { SocialLinks } from "@/components/hero/SocialLinks";
import { RoleSwitcher } from "@/components/sections/RoleSwitcher";
import styles from "./Hero.module.css";

export function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-heading">
      <div className={styles.content}>
        <h1 id="hero-heading" className={`${styles.introduction} ${styles.enter}`}>
          <span>{hero.greeting}</span>{" "}
          <span className={styles.identity}>
            <Image
              className={`${styles.portrait} ${styles.portraitLight}`}
              src={hero.portrait.src}
              alt={hero.portrait.alt}
              width={hero.portrait.width}
              height={hero.portrait.height}
              sizes="(max-width: 600px) 44px, 60px"
              preload
            />
            <Image
              className={`${styles.portrait} ${styles.portraitDark}`}
              src={hero.portrait.darkSrc}
              alt={hero.portrait.alt}
              width={hero.portrait.width}
              height={hero.portrait.height}
              sizes="(max-width: 600px) 44px, 60px"
              loading="eager"
            />
            <span>{hero.name}<span className={styles.period}>.</span></span>
          </span>
        </h1>

        <p className={`${styles.roles} ${styles.enter}`}>
          I’m a <RoleSwitcher roles={hero.roles} />
        </p>

        <p className={`${styles.description} ${styles.enter}`}>
          {hero.introduction}
        </p>

        <p className={`${styles.technology} ${styles.enter}`}>
          My everyday tools are{" "}
          {hero.tools.map((tool, index) => (
            <span key={tool}>
              {index === hero.tools.length - 1 ? "and " : ""}
              <span className={styles.tool}>{tool}</span>
              {index < hero.tools.length - 1 ? ", " : "."}
            </span>
          ))}
        </p>

        <div className={`${styles.contact} ${styles.enter}`}>
          <p>
            {hero.contactPrompt}{" "}
            <a className={styles.contactLink} href={hero.contactHref}>
              {hero.contactLabel}<span className={styles.arrow} aria-hidden="true">↗</span>
            </a>
          </p>
          <p className={styles.location}>Based in {hero.location}.</p>
        </div>

        <SocialLinks className={`${styles.socials} ${styles.enter}`} />
      </div>
    </section>
  );
}
