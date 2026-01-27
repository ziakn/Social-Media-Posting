"use client";

import { Layers, Sparkles, Clock, BarChart3, CheckCircle2 } from "lucide-react";

const coreFeatures = [
    {
        icon: <Layers className="h-6 w-6" />,
        title: "Unified Media Library",
        description: "Organize all your high-resolution assets in one central location for quick and easy sharing.",
        outcome: "Save 5+ hours weekly"
    },
    {
        icon: <Sparkles className="h-6 w-6" />,
        title: "AI Optimization Tools",
        description: "Automatically resize your videos and generate engaging captions tailored for each platform.",
        outcome: "Reach a wider audience"
    },
    {
        icon: <Clock className="h-6 w-6" />,
        title: "Smart Scheduling",
        description: "Post your content at the perfect time when your audience is most active and engaged.",
        outcome: "Reliable automated posting"
    },
    {
        icon: <BarChart3 className="h-6 w-6" />,
        title: "Actionable Analytics",
        description: "View your performance metrics across all networks in one simple, clear dashboard.",
        outcome: "Track your growth easily"
    },
];

export default function FeaturesGrid() {
    return (
        <section id="features" className="py-20 bg-white">
            <div className="container mx-auto px-6 max-w-[1280px]">
                <div className="text-center mb-24 space-y-6">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-[#0C1B33] font-plus-jakarta tracking-tight uppercase">
                        Powerful Features <br /> to <span className="text-[#3B82F6]">Scale</span> Your Social Media
                    </h2>
                    <div className="w-20 h-1.5 bg-[#F9C80E] mx-auto rounded-full" />
                    <p className="text-lg text-[#3E4652] font-medium max-w-2xl mx-auto font-inter">
                        Experience the enterprise-grade Command Center built for creators and agencies.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {coreFeatures.map((f, i) => (
                        <div key={i} className="p-10 rounded-[10px] bg-white border border-slate-100 hover:border-[#3B82F6]/30 shadow-sm hover:shadow-subtle hover:-translate-y-2 transition-all duration-500 flex flex-col group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-[100px] -mr-8 -mt-8 group-hover:bg-[#3B82F6]/5 transition-colors" />
                            <div className="w-14 h-14 rounded-xl bg-[#F5F8FB] flex items-center justify-center text-[#0C1B33] mb-10 group-hover:bg-[#0C1B33] group-hover:text-[#F9C80E] transition-all duration-500 relative z-10">
                                {f.icon}
                            </div>
                            <h3 className="text-xl font-extrabold text-[#0C1B33] mb-4 font-plus-jakarta uppercase tracking-tight relative z-10">{f.title}</h3>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8 flex-1 font-inter relative z-10">{f.description}</p>
                            <div className="pt-8 border-t border-slate-50 flex items-center gap-2 text-[10px] font-black uppercase text-[#3B82F6] tracking-[0.2em] font-plus-jakarta relative z-10">
                                <CheckCircle2 className="h-3 w-3" /> {f.outcome}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
