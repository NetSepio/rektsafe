import { Hero } from "@/components/hero";
import { Features } from "@/components/features";
import { HardwareTeaser } from "@/components/hardware-teaser";
import { HowItWorks } from "@/components/how-it-works";
import { TechStack } from "@/components/tech-stack";
import { CTA } from "@/components/cta";

export default function Home() {
  return (
    <div className="relative">
      <Hero />
      <Features />
      <HardwareTeaser />
      <HowItWorks />
      <TechStack />
      <CTA />
    </div>
  );
}
