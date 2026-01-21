"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Star, MessageSquare, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

// Sub-components
import PricingHero from "@/components/pricing/PricingHero";
import PricingToggle from "@/components/pricing/PricingToggle";
import PricingCards from "@/components/pricing/PricingCards";
import PricingFeatureMatrix from "@/components/pricing/PricingFeatureMatrix";
import PricingFaq from "@/components/pricing/PricingFaq";

// Data
import { planFeatures, pricingFaqs } from "@/lib/constants/pricing-data";

export default function PricingContent({ packages = [] }) {
  const [isAnnual, setIsAnnual] = useState(true);

  // Transform database packages into the format expected by PricingCards
  const plans = useMemo(() => {
    if (!packages || packages.length === 0) return [];

    // Group packages by name and get the appropriate billing cycle
    const packagesByName = {};

    packages.forEach(pkg => {
      if (!packagesByName[pkg.name]) {
        packagesByName[pkg.name] = {};
      }
      packagesByName[pkg.name][pkg.billingCycle] = pkg;
    });

    // Transform to the expected format
    return Object.entries(packagesByName).map(([name, cycles]) => {
      // Get the package for the current billing cycle
      const currentCycle = isAnnual ? 'yearly' : 'monthly';
      const pkg = cycles[currentCycle] || cycles['monthly'] || Object.values(cycles)[0];

      // Build checkout link with package and billing cycle
      const checkoutLink = pkg.price === 0
        ? "/auth/register"
        : `/checkout?package=${encodeURIComponent(pkg.name)}&billing=${currentCycle}`;

      return {
        name: pkg.name,
        id: pkg.name.toLowerCase(),
        description: pkg.description,
        price: pkg.price,
        interval: isAnnual ? "month" : "month",
        features: pkg.features || [],
        cta: pkg.ctaText || "Get Started",
        ctaLink: checkoutLink,
        popular: pkg.isPopular || false,
        gradient: pkg.isPopular || false,
        order: pkg.order || 0
      };
    }).sort((a, b) => a.order - b.order);
  }, [packages, isAnnual]);

  return (
    <div className="bg-gray-50 min-h-screen pt-32 pb-0 font-inter text-gray-900">
      <div className="container mx-auto px-6 max-w-7xl">
        <PricingHero />
        <PricingToggle isAnnual={isAnnual} setIsAnnual={setIsAnnual} />
        <PricingCards plans={plans} isAnnual={isAnnual} />

        {/* --- Social Proof Section --- */}
        <div className="mb-32 grid md:grid-cols-2 gap-8 items-center bg-white p-12 rounded-2xl border border-gray-200 shadow-sm">
          <div className="space-y-6">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-warning text-warning" />
              ))}
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 font-display">
              Trusted by creators and agencies worldwide.
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <p className="text-gray-600 italic">
                  "Our agency manages 40+ brands with SocialHub. The unified inbox and analytics are game changers."
                </p>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <p className="text-gray-600 italic">
                  "Posting TikTok + Pinterest at once saved me 30 hours/month. The AI captions are actually good!"
                </p>
              </div>
            </div>
            <div className="pt-4 flex flex-wrap gap-8 opacity-50 grayscale">
              <span className="font-bold text-xl tracking-tighter">CREATIVO</span>
              <span className="font-bold text-xl tracking-tighter">SOCIALFLOW</span>
              <span className="font-bold text-xl tracking-tighter">AGENCYX</span>
            </div>
          </div>
          <div className="hidden md:block relative bg-gray-50 rounded-xl h-[400px] overflow-hidden border border-gray-100">
            {/* Visual placeholder for dashboard preview */}
            <div className="absolute inset-4 bg-white rounded-lg shadow-2xl border border-gray-100 p-6 space-y-4">
              <div className="h-4 w-1/3 bg-gray-100 rounded" />
              <div className="flex gap-2">
                <div className="h-24 flex-1 bg-gray-50 rounded border border-gray-100" />
                <div className="h-24 flex-1 bg-gray-50 rounded border border-gray-100" />
              </div>
              <div className="h-32 w-full bg-gray-50 rounded border border-gray-100" />
              <div className="absolute bottom-6 right-6 h-12 w-12 bg-primary rounded-full shadow-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <PricingFeatureMatrix features={planFeatures} />
        <PricingFaq faqs={pricingFaqs} />

        {/* --- Final CTA Section --- */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary to-secondary -mx-6 px-6 py-24 sm:-mx-12 sm:px-12 md:mx-0 md:rounded-3xl mb-12">
          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-10">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white font-display">
              Start Scheduling Your Content Today
            </h2>
            <p className="text-indigo-100 text-lg max-w-xl mx-auto font-medium font-inter">
              Join thousands of creators and businesses who use us to automate their social presence.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/auth/register">
                <Button className="bg-white text-primary hover:bg-white/90 font-bold text-lg h-16 w-full sm:w-auto px-10 rounded-xl shadow-xl hover:-translate-y-1">
                  Start Free
                </Button>
              </Link>
              <Button
                variant="ghost"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="bg-transparent border-2 border-white/30 text-white font-bold text-lg h-16 w-full sm:w-auto px-10 rounded-xl hover:bg-white/10"
              >
                Compare Plans
              </Button>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-purple-900/40 rounded-full blur-[100px]" />
        </div>
      </div>
    </div>
  );
}
