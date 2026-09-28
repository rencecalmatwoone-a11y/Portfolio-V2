import { profile } from "@/data/profile";

// Public contact destinations from the original portfolio's src/App.jsx.
export const socials = [
  {
    label: "GitHub",
    href: "https://github.com/rencecalmatwoone-a11y",
    logo: "/images/socials/github.svg",
    monochrome: true,
    handle: "@rencecalmatwoone-a11y",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/johnmark-clarence-mendoza-9941322b5/",
    logo: "/images/socials/linkedin.svg",
    monochrome: false,
    handle: "johnmark-clarence-mendoza-9941322b5",
  },
  {
    label: "Email",
    href: `mailto:${profile.email}`,
    logo: "/images/socials/gmail.svg",
    monochrome: false,
    handle: profile.email,
  },
  {
    label: "X",
    href: "https://x.com/rencedezvous",
    logo: "/images/socials/x.svg",
    monochrome: true,
    handle: "@Rencedezvous",
  },
] as const;
