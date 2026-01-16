"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PricingFaq({ faqs }) {
    const [openIndex, setOpenIndex] = useState(0);

    return (
        <div className="max-w-3xl mx-auto mb-32 font-inter">
            <div className="text-center mb-12 space-y-4">
                <h2 className="text-3xl font-bold text-[#111827] tracking-tight">Frequently Asked Questions</h2>
                <p className="text-[#6B7280] font-medium text-sm">Everything you need to know about our pricing and plans.</p>
            </div>
            <div className="space-y-4">
                {faqs.map((faq, i) => (
                    <div key={i} className="border border-[#E5E7EB] rounded-xl overflow-hidden bg-white hover:border-[#4F46E5]/20 transition-all shadow-sm">
                        <button
                            onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                            className="w-full p-6 flex items-center justify-between text-left hover:bg-gray-50/50 transition-colors group"
                        >
                            <span className={cn("font-semibold transition-colors text-base", openIndex === i ? "text-[#4F46E5]" : "text-[#111827] group-hover:text-[#4F46E5]")}>
                                {faq.q}
                            </span>
                            {openIndex === i ? <ChevronUp className="h-5 w-5 text-[#4F46E5]" /> : <ChevronDown className="h-5 w-5 text-[#9CA3AF]" />}
                        </button>
                        <div className={cn("overflow-hidden transition-all duration-300 px-6", openIndex === i ? "max-h-96 pb-6" : "max-h-0")}>
                            <p className="text-[#4B5563] font-normal leading-relaxed text-base">
                                {faq.a}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
