import type { Project } from "@/types/project";

// Verified against the original portfolio's project content and screenshot assets.
// Keep absent roles, dates, repositories, and outcomes unset.
export const projects: readonly Project[] = [
  {
    slug: "ratioflow",
    title: "RatioFlow",
    description:
      "A privacy-first image utility. Adjust aspect ratios, preview changes, and export images directly in your browser.",
    category: "Image utility",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Canvas API"],
    featured: true,
    order: 1,
    liveUrl: "https://ratioflow-umber.vercel.app/",
    status: "Live",
    image: {
      src: "/images/projects/ratioflow.webp",
      alt: "RatioFlow workspace showing an image preview, aspect-ratio presets, and resize controls.",
      width: 1440,
      height: 810,
    },
  },
  {
    slug: "collecthieves-tutoy-hub",
    title: "Collecthieves (TuToy Hub)",
    description:
      "A platform for toy stores and collectors, with auctions and a virtual showroom. I contributed UI/UX design and managed the development process.",
    category: "Collectibles platform",
    role: "UI/UX Design · Project Management",
    technologies: ["Figma", "Wireframing"],
    featured: true,
    order: 2,
    liveUrl: "https://tutoyhub.shop/",
    status: "Live",
    image: {
      src: "/images/projects/collecthieves-tutoy-hub.webp",
      alt: "TuToy Hub landing page with toy listings, auction and showroom navigation, and seller registration.",
      width: 1347,
      height: 614,
    },
  },
  {
    slug: "musync",
    title: "MUSYNC",
    description:
      "A song guessing game with Spotify playback, music filters, and multiplayer through Supabase Realtime.",
    category: "Music game",
    technologies: ["React", "Node.js", "Supabase", "Spotify API", "Deezer API", "Vercel"],
    featured: true,
    order: 3,
    liveUrl: "https://musyncsongguessinggame.vercel.app/",
    status: "Live",
    image: {
      src: "/images/projects/musync.webp",
      alt: "MUSYNC song guessing interface with music filters, playback controls, and score tracking.",
      width: 1440,
      height: 810,
    },
  },
];

export const featuredProjects = projects
  .filter((project) => project.featured)
  .sort((a, b) => a.order - b.order);
