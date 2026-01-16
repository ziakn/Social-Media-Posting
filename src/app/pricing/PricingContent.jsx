"use client";

import { useState } from "react";
import Link from "next/link";

// Sub-components
import PricingHero from "@/components/pricing/PricingHero";
import PricingToggle from "@/components/pricing/PricingToggle";
import PricingCards from "@/components/pricing/PricingCards";
import PricingFeatureMatrix from "@/components/pricing/PricingFeatureMatrix";
import PricingFaq from "@/components/pricing/PricingFaq";

// Data
import { getPlans, planFeatures, pricingFaqs } from "@/lib/constants/pricing-data";

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);
  const plans = getPlans(isAnnual);

  return (
    <div className="bg-white pt-32 pb-24 font-inter text-[#3E4652]">
      <div className="container mx-auto px-6 max-w-[1280px]">
        <PricingHero />
        <PricingToggle isAnnual={isAnnual} setIsAnnual={setIsAnnual} />
        <PricingCards plans={plans} isAnnual={isAnnual} />
        <PricingFeatureMatrix features={planFeatures} />
        <PricingFaq faqs={pricingFaqs} />

        {/* --- Enterprise Block --- */}
        <div className="bg-[#0C1B33] rounded-[10px] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-[#00A2FF]/10 blur-[100px] pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-10">
            <h2 className="text-4xl md:text-6xl font-extrabold font-plus-jakarta tracking-tight leading-[0.9] uppercase">Scale Without <span className="text-[#F9C80E]">Limits.</span></h2>
            <p className="text-slate-400 font-medium text-lg max-w-lg mx-auto font-inter">Custom SLA, node permissions, and white-labeling for high-growth agencies.</p>
            <div className="flex justify-center pt-6">
              <Link href="mailto:sales@socialhub.ai">
                <button className="bg-[#F9C80E] text-[#0C1B33] font-black text-lg px-12 h-20 rounded-[6px] hover:bg-[#eac00d] transition-all shadow-xl hover:-translate-y-1 active:scale-95 font-plus-jakarta uppercase tracking-widest">
                  Connect with Sales
                </button>
              </Link>
            </div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] font-plus-jakarta pt-4">Global Infrastructure Protocol Enabled</p>
          </div>
        </div>
      </div>
    </div>
  );
}
