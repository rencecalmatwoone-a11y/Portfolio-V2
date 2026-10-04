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
    overview: [
      "RatioFlow is an image aspect-ratio converter for resizing an image, previewing the framing, and exporting the result. Ratio changes happen directly in the browser, so files stay on the user's device.",
    ],
    visuals: [
      {
        src: "/images/projects/ratioflow-upload.webp",
        alt: "RatioFlow's opening screen with a drag-and-drop area and Choose Image button for PNG, JPG, and WebP files.",
        caption: "A simple starting point: choose an image",
        width: 1440,
        height: 1000,
      },
    ],
    reflection:
      "Keeping the image workflow in the browser is central to RatioFlow's privacy-first approach. Adjustments, previews, and exports happen locally, without sending the original file to a server.",
    highlights: [
      "Real-time aspect-ratio adjustments",
      "Instant image previews",
      "Browser-based image export",
      "Local processing with no server uploads",
    ],
    image: {
      src: "/images/projects/ratioflow.webp",
      alt: "RatioFlow workspace showing an image preview, aspect-ratio presets, and resize controls.",
      width: 1440,
      height: 810,
    },
  },
  {
    slug: "tutoyhub",
    title: "Collecthieves (TuToy Hub)",
    description:
      "A platform for toy stores and collectors, with auctions and a virtual showroom. I contributed UI/UX design and managed the development process.",
    category: "Collectibles platform",
    role: "UI/UX Design · Project Management",
    technologies: ["Figma", "React", "TypeScript", "Tailwind CSS", "Wireframing"],
    featured: true,
    order: 2,
    liveUrl: "https://tutoyhub.shop/",
    status: "Live",
    overview: [
      "Collecthieves (TuToy Hub) brings toy stores and collectors in Cavite together through a storefront, auctions, and a virtual showroom.",
      "My contribution covered parts of the UI/UX design and management of the development process, with a focus on a responsive, accessible interface and a clear user journey.",
    ],
    visuals: [
      {
        src: "/images/projects/tutoyhub-platform.webp",
        alt: "TuToy Hub's platform section presenting its 360-degree showroom, auction system, and store and collector community.",
        caption: "Storefront, auctions, and showroom in one platform",
        width: 1440,
        height: 609,
      },
    ],
    reflection:
      "My design work focused on a responsive, accessible interface and a frictionless user journey. Managing the development process alongside that work helped keep the interface aligned with the platform's business goals.",
    highlights: [
      "Toy storefront for stores and collectors",
      "Auction system",
      "Virtual showroom",
    ],
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
    overview: [
      "MUSYNC is a song guessing game with music filters, playback controls, and score tracking. It combines Spotify login and playback with Deezer as a fallback, and uses Supabase for data, authentication, and Realtime multiplayer.",
    ],
    visuals: [
      {
        src: "/images/projects/musync-multiplayer.webp",
        alt: "MUSYNC's multiplayer screen with Play with Friends and Practice vs AI panels, and links to create or join a lobby and start practice.",
        caption: "Create a lobby, join friends, or practise solo",
        width: 1440,
        height: 1000,
      },
    ],
    reflection:
      "The game uses Spotify for login and playback, with Deezer as a fallback. Supabase handles data and authentication as well as the Realtime connection used for multiplayer, bringing the music and shared-game features together.",
    highlights: [
      "Song guessing with music filters",
      "Spotify login and playback",
      "Deezer fallback integration",
      "Multiplayer through Supabase Realtime",
    ],
    image: {
      src: "/images/projects/musync.webp",
      alt: "MUSYNC song guessing interface with music filters, playback controls, and score tracking.",
      width: 1440,
      height: 810,
    },
  },
  {
    slug: "my-island-surprises",
    title: "My Island Surprises",
    description:
      "I'm redesigning my client's entire website with Next.js, TypeScript, and Tailwind CSS, bringing its design and experience up to date.",
    category: "Wellness website",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS"],
    featured: true,
    order: 4,
    liveUrl: "https://www.myislandsurprises.com/",
    status: "Ongoing",
    overview: [
      "My Island Surprises is a website focused on spiritual growth and holistic well-being. I'm redesigning the entire website with Next.js, bringing its design and experience up to date.",
    ],
    image: {
      src: "/images/projects/my-island-surprises-homepage.webp",
      alt: "My Island Surprises homepage with island navigation, a jungle hero, and the start of the It's All About You section.",
      width: 1349,
      height: 636,
    },
  },
];

export const featuredProjects = projects
  .filter((project) => project.featured)
  .sort((a, b) => a.order - b.order);
