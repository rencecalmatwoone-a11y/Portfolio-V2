import Image from "next/image";
import type { ProjectImage } from "@/types/project";
import styles from "./ProjectVisual.module.css";

export function ProjectVisual({ src, alt, width, height, caption, priority = false }: ProjectImage & {
  caption?: string;
  priority?: boolean;
}) {
  return (
    <figure className={styles.visual}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes="(min-width: 1100px) 736px, (min-width: 768px) 70vw, 100vw"
        priority={priority}
        loading={priority ? undefined : "lazy"}
        className={styles.image}
      />
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  );
}
