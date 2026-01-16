"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PricingFaq({ faqs }) {
    const [openIndex, setOpenIndex] = useState(0);

    return (
        <div className="max-w-3xl mx-auto mb-32 font-inter">
            <div className="text-center mb-16 space-y-4">
                <h2 className="text-3xl font-extrabold text-[#0C1B33] font-plus-jakarta tracking-tight uppercase">Billing Protocol FAQ</h2>
                <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] font-plus-jakarta">Resolved Intelligence for Your Team</p>
            </div>
            <div className="space-y-4">
                {faqs.map((faq, i) => (
                    <div key={i} className="border border-[#E1E7EF] rounded-[10px] overflow-hidden bg-white hover:border-[#00A2FF]/20 transition-all">
                        <button
                            onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                            className="w-full p-8 flex items-center justify-between text-left hover:bg-slate-50 transition-colors group"
                        >
                            <span className={cn("font-bold transition-colors font-plus-jakarta uppercase text-sm tracking-tight", openIndex === i ? "text-[#00A2FF]" : "text-[#0C1B33] group-hover:text-[#00A2FF]")}>
                                {faq.q}
                            </span>
                            {openIndex === i ? <ChevronUp className="h-5 w-5 text-[#00A2FF]" /> : <ChevronDown className="h-5 w-5 text-slate-300" />}
                        </button>
                        <div className={cn("overflow-hidden transition-all duration-300 px-8", openIndex === i ? "max-h-96 pb-8" : "max-h-0")}>
                            <p className="text-[#3E4652] font-medium leading-relaxed text-sm max-w-2xl font-inter">
                                {faq.a}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
