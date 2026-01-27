"use client";

import { Briefcase, ShoppingBag, Palette, Building2 } from "lucide-react";
import Link from "next/link";

const solutions = [
    {
        icon: <Briefcase className="h-8 w-8" />,
        title: "For Agencies",
        desc: "Manage multiple clients with ease, generate professional reports, and handle team permissions in one place.",
        cta: "Agency Solutions"
    },
    {
        icon: <ShoppingBag className="h-8 w-8" />,
        title: "Small Business",
        desc: "Automate your social media growth without the high costs. Set your schedule and let our AI handle the rest.",
        cta: "Business Growth"
    },
    {
        icon: <Palette className="h-8 w-8" />,
        title: "Content Creators",
        desc: "Optimize your posts for TikTok and Pinterest viral trends. Expand your influence across all networks instantly.",
        cta: "Creator Tools"
    },
    {
        icon: <Building2 className="h-8 w-8" />,
        title: "Enterprise",
        desc: "Direct API access, custom support, and dedicated resources for managing your global social media presence.",
        cta: "Enterprise Access"
    }
];

export default function SolutionsSection() {
    return (
        <section id="solutions" className="py-20 bg-slate-50 border-y border-slate-100">
            <div className="container mx-auto px-6 max-w-[1280px]">
                <div className="text-center mb-24 space-y-6">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-[#0C1B33] font-plus-jakarta tracking-tight uppercase">
                        Tailored <span className="text-[#3B82F6]">Solutions</span> for You
                    </h2>
                    <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto font-inter">
                        Whether you're a solo creator or a growing agency, we have the right tools to help you succeed.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {solutions.map((sol, i) => (
                        <div key={i} className="p-10 bg-white border border-slate-200 rounded-[10px] shadow-sm hover:shadow-subtle hover:border-[#3B82F6]/30 transition-all duration-500 group">
                            <div className="w-16 h-16 rounded-xl bg-slate-50 flex items-center justify-center text-[#0C1B33] mb-10 group-hover:bg-[#3B82F6] group-hover:text-white transition-all duration-500">
                                {sol.icon}
                            </div>
                            <h3 className="text-xl font-extrabold text-[#0C1B33] mb-4 font-plus-jakarta uppercase tracking-tight">{sol.title}</h3>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed mb-10 font-inter">{sol.desc}</p>
                            <Link href="/solutions" className="inline-block">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#0C1B33] group-hover:text-[#3B82F6] transition-colors font-plus-jakarta border-b-2 border-slate-100 group-hover:border-[#3B82F6]">
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
