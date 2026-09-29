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
            <span className={styles.nameGroup}>
              <button className={styles.nameTrigger} type="button" aria-label={hero.name}>
                <span className={styles.nameText} aria-hidden="true">{hero.name}</span>
                <svg
                  className={styles.signature}
                  viewBox="231 9 233 177"
                  aria-hidden="true"
                  focusable="false"
                >
                  <mask
                    id="hero-signature-writing-mask"
                    x="231"
                    y="9"
                    width="233"
                    height="177"
                    maskUnits="userSpaceOnUse"
                  >
                    <polyline
                      className={styles.signatureWritingStroke}
                      points="245,154 255,151 270,145 285,136 302,124 319,111 335,101 336,91 341,78 348,63 357,47 368,32 378,22 383,20 387,24 387,31 382,42 375,54 365,67 350,84 336,101 335,110 340,120 348,129 360,139 372,149 377,156 376,161 368,167 354,171 338,174 326,173 318,169 315,162 318,154 325,144 335,134 349,122 365,111 385,99 406,88 402,96 395,108 389,120 385,130 388,133 396,132 407,127 419,119 429,113 433,114 438,121 442,126 446,124 450,115"
                      fill="none"
                      stroke="white"
                      strokeWidth="14"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </mask>
                  <image
                    href="/images/hero/rence-signature.png"
                    width="818"
                    height="198"
                    mask="url(#hero-signature-writing-mask)"
                  />
                </svg>
              </button>
              <span className={styles.period}>.</span>
            </span>
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
