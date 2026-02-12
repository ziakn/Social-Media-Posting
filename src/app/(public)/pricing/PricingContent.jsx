"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Star, MessageSquare, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

// Components
import BackgroundCanvas from "@/components/home/BackgroundCanvas";
import PricingHero from "@/components/pricing/PricingHero";
import PricingToggle from "@/components/pricing/PricingToggle";
import PricingCards from "@/components/pricing/PricingCards";
import PricingFeatureMatrix from "@/components/pricing/PricingFeatureMatrix";
import PricingFaq from "@/components/pricing/PricingFaq";
import NewFooter from "@/components/home/NewFooter";

// Data
import { planFeatures, pricingFaqs } from "@/lib/constants/pricing-data";

import { createCheckoutSession } from "@/app/actions/billing/stripeActions";
import { toast } from "sonner";
import { usePermissions } from "@/hooks/usePermissions";
import { useRouter } from "next/navigation";

export default function PricingContent({ packages = [] }) {
  const { user } = usePermissions();
  const router = useRouter();
  const [loadingPrice, setLoadingPrice] = useState(null);
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

      // Build registration link with package and billing cycle
      const registrationLink = `/auth/register?package=${encodeURIComponent(pkg.name)}&billing=${currentCycle}`;

      return {
        name: pkg.name,
        id: pkg.name.toLowerCase(),
        description: pkg.description,
        price: pkg.price,
        interval: isAnnual ? "year" : "month",
        features: (pkg.features || []),
        cta: "Start Now",
        priceId: pkg.stripePriceId,
        popular: pkg.isPopular || false,
        gradient: pkg.isPopular || false,
        order: pkg.order || 0
      };
    }).sort((a, b) => a.order - b.order);
  }, [packages, isAnnual]);

  const handleCheckout = async (priceId) => {
    if (!user) {
      toast.info("Please sign up or log in to subscribe.");
      router.push("/auth/register");
      return;
    }

    // Safety check for free plan which might not have a stripe price id
    if (!priceId) {
      router.push("/portal/dashboard");
      return;
    }

    setLoadingPrice(priceId);
    const result = await createCheckoutSession(priceId);
    setLoadingPrice(null);

    if (result.success && result.url) {
      window.location.href = result.url;
    } else {
      toast.error(result.error || "Failed to create checkout session");
    }
  };

  return (
    <main className="flex flex-col min-h-screen relative font-sans">
      <BackgroundCanvas />

      <div className="relative z-20 flex flex-col w-full max-w-[1440px] mx-auto px-4 md:px-8">
        <PricingHero />
        <PricingToggle isAnnual={isAnnual} setIsAnnual={setIsAnnual} />
        <PricingCards plans={plans} isAnnual={isAnnual} onCheckout={handleCheckout} loadingPrice={loadingPrice} />

        {/* Social Proof Section */}
        <div className="mb-32 grid md:grid-cols-2 gap-8 items-center bg-[rgba(255,255,255,0.4)] backdrop-blur-[12px] p-12 rounded-[32px] border border-[rgba(255,255,255,0.6)] shadow-lg">
          <div className="space-y-6">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-[#5e4a7a] text-[#5e4a7a]" />
              ))}
            </div>
            <h2 className="text-3xl font-[650] tracking-tight text-[#2d253b]">
              Trusted by creators and agencies worldwide.
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-[#5e4a7a]/10 p-2 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-[#5e4a7a]" />
                </div>
                <p className="text-[#4a3d58] italic font-[420]">
                  "Our agency manages 40+ brands with UNI.social. The unified inbox and analytics are game changers."
                </p>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-[#5e4a7a]/10 p-2 rounded-lg">
                  <Clock className="h-5 w-5 text-[#5e4a7a]" />
                </div>
                <p className="text-[#4a3d58] italic font-[420]">
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
          <div className="hidden md:block relative bg-gradient-to-br from-[#5e4a7a]/5 to-transparent rounded-xl h-[400px] overflow-hidden border border-[rgba(255,255,255,0.6)]">
            {/* Visual placeholder for dashboard preview */}
            <div className="absolute inset-4 bg-white/40 backdrop-blur-[8px] rounded-lg shadow-2xl border border-[rgba(255,255,255,0.6)] p-6 space-y-4">
              <div className="h-4 w-1/3 bg-[#5e4a7a]/10 rounded" />
              <div className="flex gap-2">
                <div className="h-24 flex-1 bg-[#5e4a7a]/5 rounded border border-[rgba(255,255,255,0.6)]" />
                <div className="h-24 flex-1 bg-[#5e4a7a]/5 rounded border border-[rgba(255,255,255,0.6)]" />
              </div>
              <div className="h-32 w-full bg-[#5e4a7a]/5 rounded border border-[rgba(255,255,255,0.6)]" />
              <div className="absolute bottom-6 right-6 h-12 w-12 bg-[#5e4a7a] rounded-full shadow-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <PricingFeatureMatrix features={planFeatures} />
        <PricingFaq faqs={pricingFaqs} />

        {/* Final CTA Section */}
        <div className="py-16 container mx-auto px-6 max-w-[1280px] font-sans mb-12">
          <div className="bg-gradient-to-br from-[#5e4a7a] to-[#2d253b] rounded-[40px] p-12 md:p-24 text-center text-white space-y-12 relative overflow-hidden shadow-2xl">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 blur-[120px] pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="space-y-6 relative z-10">
              <div className="w-16 h-16 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
                <Sparkles className="h-8 w-8 text-white fill-current" />
              </div>
              <h2 className="text-4xl md:text-[3.5rem] font-[650] tracking-[-0.02em] max-w-4xl mx-auto leading-[1.1]">
                Elevate Your Social Media Today
              </h2>
              <p className="text-[1.15rem] text-white/80 font-[420] max-w-2xl mx-auto leading-relaxed">
                Join 12,000+ creators and businesses who use UNI.social to grow their social presence.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8 relative z-10">
              <Link href="/auth/register">
                <button className="bg-white text-[#2d253b] font-bold text-[0.95rem] px-12 py-5 rounded-[16px] hover:bg-white/90 transition-all shadow-xl hover:-translate-y-1 active:scale-95 uppercase tracking-widest">
                  Start Free
                </button>
              </Link>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="bg-transparent border-2 border-white/30 text-white font-bold text-[0.95rem] px-12 py-5 rounded-[16px] hover:bg-white/10 transition-all hover:border-white/50 hover:-translate-y-1 active:scale-95 uppercase tracking-widest"
              >
                Compare Plans
              </button>
            </div>

            <div className="pt-12 text-white/60 font-bold text-[0.7rem] uppercase tracking-[0.15em] relative z-10">
              No Credit Card Required | Set Up in Seconds | AI Optimization Ready
            </div>
          </div>
        </div>

        <NewFooter />
      </div>
    </main>
  );
}
