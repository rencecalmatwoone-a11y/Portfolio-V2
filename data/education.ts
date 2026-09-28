export interface Education {
  degree: string;
  institution: string;
  logo?: string;
  location?: string;
  period?: string;
  description?: string;
}

// Degree/institution/current status: supplied Education brief.
// Start year: original portfolio's src/App.jsx education entry (2023–2027).
// Its end year is not a verified graduation date, so display Present.
export const education: Education[] = [
  {
    degree: "Bachelor of Science in Information Technology",
    institution: "National College of Science and Technology",
    logo: "/images/education/ncst-logo.png",
    location: "Cavite, Philippines",
    period: "2023 — Present",
    description:
      "Alongside my IT studies, I put what I learn into practice through interface design and front-end development projects.",
  },
  {
    degree: "High School · Senior High School",
    institution:
      "Tagaytay City Science National High School – Integrated Senior High School",
    logo: "/images/education/tcsnhs-logo.jpg",
    location: "Tagaytay, Cavite",
    period: "2016 — 2022",
  },
];
