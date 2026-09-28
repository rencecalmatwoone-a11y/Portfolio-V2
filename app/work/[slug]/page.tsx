import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { projects } from "@/data/projects";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((entry) => entry.slug === slug);
  return project ? { title: project.title, description: project.description } : {};
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = projects.find((entry) => entry.slug === slug);
  if (!project) notFound();

  // Minimal working destination; full case studies belong to a later stage.
  return (
    <main style={{ paddingBlock: "var(--space-16)", maxWidth: "46rem" }}>
      <Link href="/#work">← Selected Work</Link>
      <h1 style={{ marginTop: "var(--space-8)" }}>{project.title}</h1>
      <p>{project.description}</p>
      <p>Case study coming soon.</p>
      <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">Visit live project ↗</a>
    </main>
  );
}
