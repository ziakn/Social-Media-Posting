"use client";

import Link from "next/link";
import { ChevronDown, ChevronUp, ArrowRight } from "lucide-react";

export default function HelpFaqAccordion({ questions, openIndex, setOpenIndex }) {
    return (
        <div className="lg:col-span-8">
            <div className="space-y-6">
                {questions.map((faq, i) => (
                    <div key={i} className="border-b border-slate-100 last:border-0 font-inter">
                        <button
                            className="w-full py-8 text-left flex justify-between items-center group"
                            onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                        >
                            <span className={`text-xl font-extrabold uppercase tracking-tight transition-colors font-plus-jakarta ${openIndex === i ? 'text-[#00A2FF]' : 'text-[#0C1B33] group-hover:text-[#00A2FF]'}`}>
                                {faq.q}
                            </span>
                            {openIndex === i ? <ChevronUp className="h-6 w-6 text-[#00A2FF]" /> : <ChevronDown className="h-6 w-6 text-slate-300" />}
                        </button>
                        <div className={`overflow-hidden transition-all duration-300 ${openIndex === i ? 'max-h-96 pb-8' : 'max-h-0'}`}>
                            <p className="text-lg leading-relaxed text-[#3E4652] font-medium max-w-2xl font-inter">
                                {faq.a}
                            </p>
                            <div className="mt-6 flex gap-4">
                                <Link href="/guide" className="text-[10px] font-black text-[#00A2FF] uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform font-plus-jakarta">
                                    Read full guide <ArrowRight className="h-3 w-3" />
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
