export interface Project {
  slug: string;
  title: string;
  description: string;
  category: string;
  role?: string;
  technologies: readonly string[];
  featured: boolean;
  order: number;
  liveUrl: string;
  status?: "Live";
  image: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
}
