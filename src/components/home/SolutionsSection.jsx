"use client";

import { Briefcase, ShoppingBag, Palette, Building2 } from "lucide-react";
import Link from "next/link";

const solutions = [
    {
        icon: <Briefcase className="h-6 w-6" />,
        title: "For Agencies",
        desc: "Manage multiple clients with ease, generate professional reports, and handle team permissions in one place.",
        cta: "Agency Solutions",
        color: "bg-[#F9C80E]"
    },
    {
        icon: <ShoppingBag className="h-6 w-6" />,
        title: "Small Business",
        desc: "Automate your social media growth without the high costs. Set your schedule and let our AI handle the rest.",
        cta: "Business Growth",
        color: "bg-[#5e4a7a]"
    },
    {
        icon: <Palette className="h-6 w-6" />,
        title: "Content Creators",
        desc: "Optimize your posts for TikTok and Pinterest viral trends. Expand your influence across all networks instantly.",
        cta: "Creator Tools",
        color: "bg-[#2d253b]"
    },
    {
        icon: <Building2 className="h-6 w-6" />,
        title: "Enterprise",
        desc: "Direct API access, custom support, and dedicated resources for managing your global social media presence.",
        cta: "Enterprise Access",
        color: "bg-[#27C93F]"
    }
];

export default function SolutionsSection() {
    return (
        <section id="solutions" className="py-24 relative overflow-hidden font-sans">
            <div className="container mx-auto px-6 max-w-[1280px]">
                <div className="text-center mb-16 space-y-6">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-[50px] bg-[#5e4a7a]/5 border border-[#5e4a7a]/10 backdrop-blur-[4px] text-[0.8rem] font-bold uppercase tracking-widest text-[#5e4a7a]">
                        <Briefcase className="h-3.5 w-3.5" />
                        Tailored Solutions
                    </span>
                    <h2 className="text-3xl md:text-[2.8rem] font-[650] text-[#2d253b] tracking-[-0.03em] leading-[1.15]">
                        Tailored <span className="text-[#5e4a7a]">Solutions</span> for You
                    </h2>
                    <p className="text-[1.1rem] text-[#4a3d58] font-[420] leading-relaxed max-w-2xl mx-auto">
                        Whether you're a solo creator or a growing agency, we have the right tools to help you succeed.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {solutions.map((sol, i) => (
                        <div key={i} className="p-8 bg-[rgba(255,255,255,0.4)] backdrop-blur-[12px] border border-[rgba(255,255,255,0.6)] rounded-[32px] shadow-lg hover:shadow-xl hover:bg-[rgba(255,255,255,0.6)] transition-all duration-300 group flex flex-col items-start">
                            <div className={`w-14 h-14 rounded-[16px] ${sol.color} flex items-center justify-center text-white mb-6 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                                {sol.icon}
                            </div>
                            <h3 className="text-[1.3rem] font-bold text-[#2d253b] mb-3 tracking-tight">{sol.title}</h3>
                            <p className="text-[0.95rem] text-[#4a3d58] font-normal leading-relaxed mb-8 flex-1">{sol.desc}</p>

                            <Link href="/solutions" className="inline-block mt-auto">
                                <span className="text-[0.8rem] font-bold uppercase tracking-widest text-[#5e4a7a] group-hover:text-[#2d253b] transition-colors border-b-2 border-[#5e4a7a]/20 group-hover:border-[#2d253b] pb-1">
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
