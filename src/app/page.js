import HeroSection from "@/components/home/HeroSection";
import PlatformStrip from "@/components/home/PlatformStrip";
import FeaturesGrid from "@/components/home/FeaturesGrid";
import WorkflowSteps from "@/components/home/WorkflowSteps";
import CalendarPreviewSection from "@/components/home/CalendarPreviewSection";
import AIToolsSection from "@/components/home/AIToolsSection";
import VisualGallerySection from "@/components/home/VisualGallerySection";
import AnalyticsDashboard from "@/components/home/AnalyticsDashboard";
import SolutionsSection from "@/components/home/SolutionsSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import ReliabilitySection from "@/components/home/ReliabilitySection";
import PricingPreview from "@/components/home/PricingPreview";
import ResourcesTeaser from "@/components/home/ResourcesTeaser";
import FinalCTA from "@/components/home/FinalCTA";

export const metadata = {
  title: "Multi-Platform Social Media Scheduler | SocialHub",
  description: "Manage TikTok, Pinterest, Instagram, and more in one AI-powered platform. Schedule, publish, and analyze your content effortlessly.",
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "SocialHub",
    "url": "https://social-hub-demo.vercel.app",
    "logo": "https://social-hub-demo.vercel.app/logo.svg",
    "sameAs": [
      "https://twitter.com/SocialHub",
      "https://linkedin.com/company/SocialHub"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-555-SOCIAL",
      "contactType": "customer service"
    }
  };

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "SocialHub Social Media Tool",
    "description": "Multi-platform social media scheduling and automation tool for agencies and creators.",
    "brand": {
      "@type": "Brand",
      "name": "SocialHub"
    },
    "offerModel": {
      "@type": "Offer",
      "priceCurrency": "USD",
      "price": "0.00",
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <main className="overflow-x-hidden pt-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      <HeroSection />
      <PlatformStrip />
      <FeaturesGrid />
      <WorkflowSteps />
      <CalendarPreviewSection />
      <AIToolsSection />
      <VisualGallerySection />
      <AnalyticsDashboard />
      <SolutionsSection />
      <TestimonialsSection />
      <ReliabilitySection />
      <PricingPreview />
      <ResourcesTeaser />
      <FinalCTA />
    </main>
  );
}