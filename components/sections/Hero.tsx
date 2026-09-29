import Image from "next/image";
import { hero } from "@/data/hero";
import { SocialLinks } from "@/components/hero/SocialLinks";
import { WalkingFigure } from "@/components/hero/WalkingFigure";
import { DotGridPattern } from "@/components/background-pattern/dot-grid-pattern";
import { RoleSwitcher } from "@/components/sections/RoleSwitcher";
import styles from "./Hero.module.css";

const toolLogoFiles = {
  Figma: "figma.svg",
  React: "react.svg",
  "Next.js": "nextjs.svg",
  TypeScript: "typescript.svg",
  "Tailwind CSS": "tailwind.svg",
  WordPress: "wordpress.svg",
  "Google Stitch": "google-stitch.png",
} as const;

function ToolMarks({ tools }: { tools: readonly string[] }) {
  return (
    <span className={styles.toolMarks} aria-label={`Tools: ${tools.join(", ")}`}>
      {tools.map((tool) => (
        <button className={styles.toolMark} key={tool} type="button" aria-label={tool}>
          <Image
            className={tool === "Next.js" ? styles.monochromeLogo : undefined}
            src={`/images/tools/${toolLogoFiles[tool as keyof typeof toolLogoFiles]}`}
            alt=""
            width={16}
            height={16}
          />
          <span className={styles.toolTooltip} aria-hidden="true">{tool}</span>
        </button>
      ))}
    </span>
  );
}

export function Hero() {
  return (
    <section className={`${styles.hero} hero-guideline`} aria-labelledby="hero-heading">
      <div className={styles.content}>
        <h1 id="hero-heading" className={`${styles.introduction} ${styles.enter}`}>
          <span>{hero.greeting}</span>{" "}
          <span className={styles.identity}>
            <span className={styles.portraitFrame}>
            <Image
              className={`${styles.portrait} ${styles.portraitLight}`}
              src={hero.portrait.src}
              alt={hero.portrait.alt}
              width={hero.portrait.width}
              height={hero.portrait.height}
              sizes="(max-width: 600px) 56px, 72px"
              preload
            />
            <Image
              className={`${styles.portrait} ${styles.portraitDark}`}
              src={hero.portrait.darkSrc}
              alt={hero.portrait.alt}
              width={hero.portrait.width}
              height={hero.portrait.height}
              sizes="(max-width: 600px) 56px, 72px"
              loading="eager"
            />
            </span>
            <span>{hero.name}<span className={styles.period}>.</span></span>
          </span>
        </h1>

        <p className={`${styles.roles} ${styles.enter}`}>
          I’m a <RoleSwitcher roles={hero.roles} />
        </p>

        <div className={`${styles.descriptions} ${styles.enter}`}>
          {hero.descriptions.map((description) => (
            <p className={styles.description} key={description.text}>
              <span>{description.text}</span>{" "}
              <ToolMarks tools={description.tools} />
            </p>
          ))}
        </div>

        <SocialLinks className={`${styles.socials} ${styles.enter}`} />
      </div>
      <DotGridPattern className={styles.pattern} aria-hidden="true" />
      <WalkingFigure />
    </section>
  );
}
