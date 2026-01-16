"use client";

import { Badge } from "@/components/ui/badge";

export default function PricingHero() {
    return (
        <div className="text-center mb-20 space-y-6">
            <Badge className="bg-slate-50 text-[#00A2FF] border-[#E1E7EF] uppercase tracking-[0.2em] text-[10px] px-4 py-1.5 font-black font-plus-jakarta">Premium Protocols</Badge>
            <h1 className="text-5xl md:text-7xl font-extrabold text-[#0C1B33] tracking-tighter font-plus-jakarta uppercase leading-[0.9]">
                Simple, <span className="text-[#00A2FF]">Transparent</span> <br /> Pricing for Scale
            </h1>
            <p className="text-xl text-[#3E4652] max-w-2xl mx-auto font-medium leading-relaxed font-inter">
                Choose the protocol that fits your team. All plans include our AI Media Lab and multi-platform distribution engines.
            </p>
        </div>
    );
}
