import { profile } from "@/data/profile";

export const hero = {
  greeting: "Hello, I’m",
  name: profile.preferredName,
  roles: profile.roles,
  introduction: profile.introduction,
  tools: profile.primaryTools,
  contactPrompt: "Have something in mind?",
  contactLabel: "Let’s talk",
  contactHref: profile.contactHref,
  location: profile.location,
  portrait: profile.portrait,
} as const;
