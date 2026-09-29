export interface ProjectImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface ProjectVisualData extends ProjectImage {
  caption: string;
}

export interface Project {
  slug: string;
  title: string;
  description: string;
  category: string;
  role?: string;
  technologies: readonly string[];
  featured: boolean;
  order: number;
  liveUrl?: string;
  repositoryUrl?: string;
  overview?: readonly string[];
  visuals?: readonly ProjectVisualData[];
  reflection?: string;
  highlights?: readonly string[];
  status?: "Live";
  image: ProjectImage;
}
