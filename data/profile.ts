// Verified against the original portfolio's src/App.jsx (profile and services).
export const profile = {
  name: "John Mark Clarence Mendoza",
  preferredName: "Rence",
  roles: ["Front-End Developer", "UI/UX Designer"],
  location: "Cavite, Philippines",
  introduction:
    "I design interfaces and build responsive web applications. From wireframes to working products, I bring design, front-end development, and project planning together to keep the work clear and on track.",
  primaryTools: ["Figma", "React", "Next.js", "TypeScript", "Tailwind CSS"],
  portrait: {
    src: "/images/profile/john-mark-light.png",
    darkSrc: "/images/profile/john-mark-dark.png",
    alt: "Portrait of John Mark Clarence Mendoza",
    width: 1254,
    height: 1254,
  },
  contactHref: "https://johnmark-clarence-mendoza.vercel.app/#contact",
  email: "rencecalmatwo.one@gmail.com",
} as const;
