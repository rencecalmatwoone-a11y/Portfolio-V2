import { Hero } from "@/components/sections/Hero";
import { Certifications } from "@/components/sections/Certifications";
import { Education } from "@/components/sections/Education";
import { GitHubActivity } from "@/components/sections/GitHubActivity";
import { SelectedWork } from "@/components/sections/SelectedWork";
import { TechStack } from "@/components/sections/TechStack";

export default function HomePage() {
  return (
    <main className="page-grid">
      <Hero />
      <SelectedWork />
      <TechStack />
      <Education />
      <Certifications />
      <GitHubActivity />
    </main>
  );
}
