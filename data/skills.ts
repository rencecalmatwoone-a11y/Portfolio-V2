type SkillCategory = {
  readonly id: string;
  readonly label: string;
  readonly items: readonly string[];
};

// Verified against the original portfolio's src/App.jsx skills, services,
// and project content. See CONTENT_AUDIT.md for the source mapping.
export const skills = [
  {
    id: "front-end",
    label: "Front-End",
    items: ["Next.js", "React", "TypeScript", "JavaScript", "HTML", "CSS", "Tailwind CSS"],
  },
  {
    id: "design",
    label: "Design",
    items: ["Figma", "Google Stitch", "WordPress"],
  },
  {
    id: "tools",
    label: "Tools",
    items: ["Git", "GitHub", "Vercel"],
  },
] as const satisfies readonly SkillCategory[];
