export const navigation = [
  { id: "work", label: "Work" },
  { id: "stack", label: "Stack" },
  { id: "education", label: "Education" },
  { id: "certifications", label: "Certifications" },
  { id: "github", label: "GitHub" },
] as const;

export type SectionId = (typeof navigation)[number]["id"];
