"use client";

import { cn } from "@/lib/utils";

export default function PricingToggle({ isAnnual, setIsAnnual }) {
    return (
        <div className="flex flex-col items-center gap-4 mb-16">
            <div className="flex items-center justify-center gap-4 font-inter">
                <button
                    onClick={() => setIsAnnual(false)}
                    className={cn(
                        "text-sm font-semibold transition-colors",
                        !isAnnual ? "text-[#111827]" : "text-[#6B7280]"
                    )}
                >
                    Monthly
                </button>
                <button
                    onClick={() => setIsAnnual(!isAnnual)}
                    className={cn(
                        "w-12 h-6 rounded-full p-1 relative transition-all duration-300 ease-in-out",
                        isAnnual ? "bg-[#4F46E5]" : "bg-[#E5E7EB]"
                    )}
                >
                    <div className={cn(
                        "w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ease-in-out",
                        isAnnual ? "translate-x-6" : "translate-x-0"
                    )} />
                </button>
                <button
                    onClick={() => setIsAnnual(true)}
                    className={cn(
                        "text-sm font-semibold flex items-center gap-2 transition-colors",
                        isAnnual ? "text-[#111827]" : "text-[#6B7280]"
                    )}
                >
                    Annual
                    <span className="bg-[#DCFCE7] text-[#166534] font-bold text-[11px] px-2.5 py-0.5 rounded-full border border-[#BBF7D0]">
                        Save 20%
                    </span>
                </button>
            </div>
            <p className="text-xs text-[#6B7280] font-medium">
                Helps push annual payments for MRR stability.
            </p>
        </div>
    );
}
