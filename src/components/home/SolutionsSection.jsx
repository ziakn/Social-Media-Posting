"use client";

import { Briefcase, ShoppingBag, Palette, Building2 } from "lucide-react";
import Link from "next/link";

const solutions = [
    {
        icon: <Briefcase className="h-8 w-8" />,
        title: "For Agencies",
        desc: "Multi-client management, white-label reporting, and hierarchical team permissions for high-volume units.",
        cta: "Agency Protocol"
    },
    {
        icon: <ShoppingBag className="h-8 w-8" />,
        title: "Small Business",
        desc: "Zero-budget growth automation. Set your content nodes once and let AI handle the distribution consistency.",
        cta: "Growth Starter"
    },
    {
        icon: <Palette className="h-8 w-8" />,
        title: "Content Creators",
        desc: "Native optimization for TikTok and Pinterest viral windows. Scale your influence across 9+ networks instantly.",
        cta: "Creator Mode"
    },
    {
        icon: <Building2 className="h-8 w-8" />,
        title: "Enterprise",
        desc: "Direct API access, custom SLA protocols, and dedicated account engineering for global social infrastructure.",
        cta: "Enterprise Access"
    }
];

export default function SolutionsSection() {
    return (
        <section id="solutions" className="py-32 bg-slate-50 border-y border-slate-100">
            <div className="container mx-auto px-6 max-w-[1280px]">
                <div className="text-center mb-24 space-y-6">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-[#0C1B33] font-plus-jakarta tracking-tight uppercase">
                        Tailored <span className="text-[#00A2FF]">Resonance</span> Solutions
                    </h2>
                    <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto font-inter">
                        Whether you're a solo creator or a global agency, we have the protocol for your scale.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {solutions.map((sol, i) => (
                        <div key={i} className="p-10 bg-white border border-slate-200 rounded-[10px] shadow-sm hover:shadow-subtle hover:border-[#00A2FF]/30 transition-all duration-500 group">
                            <div className="w-16 h-16 rounded-xl bg-slate-50 flex items-center justify-center text-[#0C1B33] mb-10 group-hover:bg-[#00A2FF] group-hover:text-white transition-all duration-500">
                                {sol.icon}
                            </div>
                            <h3 className="text-xl font-extrabold text-[#0C1B33] mb-4 font-plus-jakarta uppercase tracking-tight">{sol.title}</h3>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed mb-10 font-inter">{sol.desc}</p>
                            <Link href="/solutions" className="inline-block">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#0C1B33] group-hover:text-[#00A2FF] transition-colors font-plus-jakarta border-b-2 border-slate-100 group-hover:border-[#00A2FF]">
                                    {sol.cta}
                                </span>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
