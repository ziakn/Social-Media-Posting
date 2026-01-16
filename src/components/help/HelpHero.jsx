"use client";

import Link from "next/link";
import { Search, Zap } from "lucide-react";

export default function HelpHero() {
    return (
        <section className="pt-32 pb-24 bg-[#0C1B33] text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-[#00A2FF]/10 blur-[100px] pointer-events-none" />
            <div className="container mx-auto px-6 max-w-[1280px] relative z-10 text-center space-y-12">
                <div className="space-y-6">
                    <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black text-[#00A2FF] uppercase tracking-widest hover:text-[#F9C80E] transition-colors font-plus-jakarta">
                        <Zap className="h-4 w-4" /> SocialHub Command Center
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-extrabold font-plus-jakarta uppercase tracking-tighter leading-none">
                        How can we <span className="text-[#00A2FF]">help your scale?</span>
                    </h1>
                    <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto font-inter">
                        Explore our intelligence database for platform strategies, node setup, and protocol troubleshooting.
                    </p>
                </div>
            </div>
        </section>
    );
}
