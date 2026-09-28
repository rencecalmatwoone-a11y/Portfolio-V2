export interface Certification {
  id: string;
  title: string;
  issuer: string;
  category: string;
  kind: string;
  description: string;
  date?: string;
  credentialId?: string;
  credentialUrl?: string;
  certificateImage?: { src: string; width: number; height: number; alt: string };
  issuerLogo?: string;
  credentialBadge?: string;
  skills?: string[];
  status: "completed" | "in-progress";
}

// Migrated from the owner's original portfolio: src/App.jsx, certifications.
// Completion is recorded there. Dates and expanded names below were checked
// against public issuer records; uncertain dates, IDs, and scans stay omitted.
// See CONTENT_AUDIT.md for provenance and public-link verification limits.
export const certifications: Certification[] = [
  {
    id: "ibm-front-end",
    title: "IBM Front-End Developer",
    date: "Jul 2026",
    issuer: "IBM",
    category: "Front-end",
    kind: "Professional certificate",
    description: "Focused on building responsive interfaces, polished user experiences, and maintainable front-end architecture.",
    issuerLogo: "/images/certifications/ibm.webp",
    credentialUrl: "https://www.coursera.org/account/accomplishments/professional-cert/VVJ5N064B6XN",
    status: "completed",
  },
  {
    id: "microsoft-project-management",
    title: "Project Management Fundamentals",
    date: "Jul 2026",
    issuer: "Microsoft",
    category: "Project management",
    kind: "Course",
    description: "Core principles of planning, execution, communication, and successful digital project delivery.",
    issuerLogo: "/images/certifications/microsoft.webp",
    credentialUrl: "https://www.coursera.org/account/accomplishments/verify/ETX6PQB96PKE",
    status: "completed",
  },
  {
    id: "packt-security",
    title: "CompTIA Security+ (SY0-701) Specialization",
    issuer: "Packt",
    category: "Security",
    kind: "Specialization",
    description: "Focused on cybersecurity fundamentals, operational security, and resilient system practices.",
    issuerLogo: "/images/certifications/packt.webp",
    credentialUrl: "https://www.coursera.org/account/accomplishments/specialization/PT0AFOSJ1HLK",
    status: "completed",
  },
  {
    id: "ncst-iot",
    title: "IoT Seminar",
    date: "Nov 2023",
    issuer: "NCST",
    category: "IoT",
    kind: "Seminar",
    description: "A seminar credential covering IoT concepts, connected systems, and emerging technology applications.",
    issuerLogo: "/images/education/ncst-logo.png",
    credentialUrl: "https://credsverse.com/credentials/ca9e8a9a-519d-4b0c-8bdb-4e72bb8f8ca5?preview=1",
    status: "completed",
  },
  {
    id: "ibm-ai",
    title: "AI Fundamentals: Foundations for Understanding AI",
    date: "Aug 2026",
    issuer: "IBM SkillsBuild",
    category: "AI",
    kind: "Credential",
    description: "Foundational concepts in artificial intelligence and its practical applications.",
    credentialBadge: "/images/certifications/ai-fundamentals.webp",
    credentialUrl: "https://www.credly.com/badges/996e6d25-1f0c-4114-8bd4-28d3938bac6d",
    status: "completed",
  },
  {
    id: "databricks-generative-ai",
    title: "Generative AI Fundamentals",
    issuer: "Databricks",
    category: "Generative AI",
    kind: "Credential",
    description: "An introduction to generative AI concepts and applications.",
    issuerLogo: "/images/certifications/databricks-logo.svg",
    // The original download link now redirects to the Academy portal.
    // Add a public credential URL once one is available.
    status: "completed",
  },
  {
    id: "cisco-it-support",
    title: "IT Customer Support Basics",
    date: "Jul 2026",
    issuer: "Cisco",
    category: "IT support",
    kind: "Credential",
    description: "Foundational skills for assisting customers and resolving everyday IT issues.",
    credentialBadge: "/images/certifications/it-customer-support.webp",
    credentialUrl: "https://www.credly.com/badges/87c9454f-697e-4e19-a5d0-7d0fb5b3c401/public_url",
    status: "completed",
  },
  {
    id: "hackerrank-sql",
    title: "SQL (Advanced)",
    issuer: "HackerRank",
    category: "Database",
    kind: "Certificate",
    description: "Advanced SQL skills for querying and working with relational data.",
    issuerLogo: "/images/certifications/hackerrank-logo.svg",
    credentialUrl: "https://www.hackerrank.com/certificates/c1aff7f5b805",
    status: "completed",
  },
  {
    id: "google-technical-support",
    title: "Technical Support Fundamentals",
    date: "Jul 2026",
    issuer: "Google",
    category: "IT support",
    kind: "Course",
    description: "Core technical support concepts, troubleshooting, and IT fundamentals.",
    issuerLogo: "/images/certifications/google-logo.svg",
    credentialUrl: "https://www.coursera.org/account/accomplishments/verify/38CLSQF1TA7H",
    status: "completed",
  },
];
