"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function PricingHero() {
    return (
        <div className="text-center mb-16 space-y-8">
            <Badge className="bg-indigo-50 text-[#4F46E5] border-indigo-100 uppercase tracking-widest text-[10px] px-4 py-1.5 font-bold font-inter">
                Pricing Plans
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-[#111827] tracking-tight font-inter max-w-4xl mx-auto leading-tight">
                Simple, Fair Pricing for <br className="hidden md:block" />
                <span className="text-[#4F46E5]">Creators, Businesses & Agencies</span>
            </h1>
            <p className="text-lg text-[#374151] max-w-2xl mx-auto font-normal leading-relaxed font-inter">
                Start free — upgrade when you need more power. All plans include our core multi-platform scheduling engine.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link href="/auth/signup">
                    <button className="bg-[#4F46E5] text-white font-semibold text-base px-8 h-14 rounded-lg hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg active:scale-95 w-full sm:w-auto">
                        Get Started Free
                    </button>
                </Link>
                <Link href="/features">
                    <button className="bg-white text-[#111827] border border-[#E5E7EB] font-semibold text-base px-8 h-14 rounded-lg hover:bg-gray-50 transition-all shadow-sm active:scale-95 w-full sm:w-auto">
                        See All Features
                    </button>
                </Link>
            </div>
        </div>
    );
}
