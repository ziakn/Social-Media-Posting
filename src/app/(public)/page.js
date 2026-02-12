import BackgroundCanvas from "@/components/home/BackgroundCanvas";
import NewHero from "@/components/home/NewHero";
import FeaturesGrid from "@/components/home/FeaturesGrid";
import WorkflowSteps from "@/components/home/WorkflowSteps";
import CalendarPreviewSection from "@/components/home/CalendarPreviewSection";
import AIToolsSection from "@/components/home/AIToolsSection";
import VisualGallerySection from "@/components/home/VisualGallerySection";
import AnalyticsDashboard from "@/components/home/AnalyticsDashboard";
import SolutionsSection from "@/components/home/SolutionsSection";
import PricingPreview from "@/components/home/PricingPreview";
import TestimonialSection from "@/components/home/TestimonialSection";
import FinalCTA from "@/components/home/FinalCTA";
import NewFooter from "@/components/home/NewFooter";
import { getPublicPackages } from "@/app/actions/website/packages/packagesActions";

export const metadata = {
  title: "UNI.social · enterprise social management",
  description: "Unified social media management for modern teams. Connect, publish, and analyze — all from a single interface.",
};

export default async function Home() {
  const result = await getPublicPackages();
  const packages = result.success ? result.packages : [];

  return (
    <main className="flex flex-col min-h-screen relative font-sans text-[#1e1a2b]">
      <BackgroundCanvas />

      <div className="relative z-20 flex flex-col w-full max-w-[1440px] mx-auto px-4 md:px-8">
        <NewHero />
        <FeaturesGrid />

        {/* Content Sections with Glassmorphism Wrapper Style if needed, or just spaced */}
        <div className="space-y-24 my-16">
          <WorkflowSteps />
          <CalendarPreviewSection />
          <AIToolsSection />
          <VisualGallerySection />
          <AnalyticsDashboard />
          <SolutionsSection />
          <PricingPreview packages={packages} />
        </div>

        <TestimonialSection />
        <FinalCTA />
        <NewFooter />
      </div>
    </main>
  );
}