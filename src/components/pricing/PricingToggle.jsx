"use client";

import { cn } from "@/lib/utils";

export default function PricingToggle({ isAnnual, setIsAnnual }) {
    return (
        <div className="flex items-center justify-center gap-6 pt-4 mb-20 font-plus-jakarta">
            <button
                onClick={() => setIsAnnual(false)}
                className={cn("text-xs font-black uppercase tracking-widest transition-colors", !isAnnual ? "text-[#0C1B33]" : "text-slate-400")}
            >
                Monthly
            </button>
            <button
                onClick={() => setIsAnnual(!isAnnual)}
                className="w-14 h-8 bg-slate-100 rounded-full p-1 relative transition-colors hover:bg-slate-200"
            >
                <div className={cn(
                    "w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300",
                    isAnnual ? "translate-x-6" : "translate-x-0"
                )} />
            </button>
            <button
                onClick={() => setIsAnnual(true)}
                className={cn("text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-colors", isAnnual ? "text-[#0C1B33]" : "text-slate-400")}
            >
                Annual
                <span className="bg-[#28C76F] text-white font-black text-[9px] px-2 py-0.5 rounded-full">-20% Discount</span>
            </button>
        </div>
    );
}
