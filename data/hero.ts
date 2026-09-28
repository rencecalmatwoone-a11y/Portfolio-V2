import { profile } from "@/data/profile";

export const hero = {
  greeting: "Hello, I’m",
  name: profile.preferredName,
  roles: profile.roles,
  descriptions: [
    {
      text: "I design interfaces and build responsive web applications.",
      tools: ["Figma", "React", "Next.js", "TypeScript", "Tailwind CSS"],
    },
    {
      text: "From wireframes to working products, I bring design and front-end development together to keep the work clear and on track.",
      tools: ["Figma", "WordPress", "Google Stitch"],
    },
  ],
  contactPrompt: "Have something in mind?",
  contactLabel: "Let’s talk",
  contactHref: profile.contactHref,
  location: profile.location,
  portrait: profile.portrait,
} as const;
