"use client";

import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function BlogHero() {
    return (
        <div className="bg-white pt-32 pb-24 relative overflow-hidden">
            <div className="container mx-auto px-6 max-w-[1280px] relative z-10 text-center">
                <div className="max-w-4xl mx-auto space-y-8">
                    <Badge className="bg-slate-50 text-[#00A2FF] border-[#E1E7EF] uppercase tracking-[0.2em] text-[10px] px-4 py-1.5 font-black">Resources & Insights</Badge>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-[#0C1B33] tracking-tighter leading-none font-plus-jakarta uppercase">
                        Digital <span className="text-[#00A2FF]">Intelligence.</span>
                    </h1>
                    <p className="text-xl text-[#3E4652] font-medium leading-relaxed max-w-2xl mx-auto pt-4 font-inter">
                        Actionable intelligence for modern social media teams. We translate complex network signals into professional growth frameworks.
                    </p>
                </div>
            </div>
        </div>
    );
}
