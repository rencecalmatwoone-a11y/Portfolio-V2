import { Hero } from "@/components/sections/Hero";
import { ClosingQuote } from "@/components/sections/ClosingQuote";
import { SectionReveals } from "@/components/layout/SectionReveals";
import { Certifications } from "@/components/sections/Certifications";
import { Education } from "@/components/sections/Education";
import { GitHubActivity } from "@/components/sections/GitHubActivity";
import { SelectedWork } from "@/components/sections/SelectedWork";
import { TechStack } from "@/components/sections/TechStack";

export default function HomePage() {
  return (
    <SectionReveals>
      <Hero />
      <SelectedWork />
      <TechStack />
      <Education />
      <Certifications />
      <GitHubActivity />
      <ClosingQuote />
    </SectionReveals>
  );
}
