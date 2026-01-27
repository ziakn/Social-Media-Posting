"use client";

import { cn } from "@/lib/utils";

const platforms = [
    { name: "TikTok", color: "text-slate-400" },
    { name: "Pinterest", color: "text-slate-400" },
    { name: "Instagram", color: "text-slate-400" },
    { name: "Bluesky", color: "text-slate-400" },
    { name: "LinkedIn", color: "text-slate-400" },
    { name: "Threads", color: "text-slate-400" },
    { name: "Facebook", color: "text-slate-400" },
    { name: "YouTube", color: "text-slate-400" },
    { name: "Snapchat", color: "text-slate-400" },
];

export default function PlatformStrip() {
    return (
        <section className="py-12 bg-slate-50 border-y border-slate-100 overflow-hidden">
            <div className="container mx-auto px-6 mb-12">
                <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400 font-plus-jakarta">Integrated with every 2026 growth node</p>
            </div>
            <div className="relative flex">
                <div className="flex animate-marquee whitespace-nowrap">
                    {[...platforms, ...platforms, ...platforms].map((platform, idx) => (
                        <div key={idx} className="flex items-center mx-16 gap-3 opacity-30 hover:opacity-100 transition-opacity cursor-default grayscale hover:grayscale-0 group">
                            <span className={cn("text-2xl font-black tracking-tighter font-plus-jakarta transition-colors group-hover:text-[#0C1B33]", platform.color)}>
                                {platform.name}
                            </span>
                            <span className="sr-only">{platform.name} platform integration</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
