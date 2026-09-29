import type { Project } from "@/types/project";

export const navigation = [
  { id: "work", label: "Projects" },
  { id: "stack", label: "Stack" },
  { id: "education", label: "Education" },
  { id: "certifications", label: "Certifications" },
  { id: "github", label: "GitHub" },
] as const;

export type SectionId = (typeof navigation)[number]["id"];

export type IndexItem = { id: string; label: string };

export function projectNavigation(project: Project): readonly IndexItem[] {
  return [
    ...(project.overview?.length ? [{ id: "overview", label: "Overview" }] : []),
    ...(project.technologies.length ? [{ id: "stack", label: "Stack" }] : []),
    ...(project.visuals?.length ? [{ id: "gallery", label: "Gallery" }] : []),
    ...(project.highlights?.length ? [{ id: "highlights", label: "Highlights" }] : []),
  ];
}
