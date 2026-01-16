"use client";

import Link from "next/link";
import { Mail, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BlogSidebar() {
    return (
        <aside className="lg:col-span-4 space-y-10">
            {/* Newsletter Card */}
            <div className="bg-[#0C1B33] rounded-[10px] p-8 text-white relative overflow-hidden shadow-subtle group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#00A2FF]/10 blur-3xl pointer-events-none" />
                <div className="relative z-10 space-y-6 text-center">
                    <Mail className="h-10 w-10 text-[#F9C80E] mx-auto group-hover:scale-110 transition-transform" />
                    <h2 className="text-2xl font-extrabold font-plus-jakarta tracking-tighter uppercase leading-tight">Weekly <br /> Platform Signals.</h2>
                    <p className="text-slate-400 font-medium text-sm leading-relaxed font-inter">The high-velocity digest on decentralized social graphs and growth strategies.</p>
                    <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                        <input
                            type="email"
                            placeholder="Engineering Email"
                            className="w-full h-14 rounded-[6px] px-6 bg-white/5 border border-white/10 text-sm font-bold placeholder:text-slate-600 focus:bg-white/10 outline-none transition-all font-inter"
                        />
                        <button className="w-full bg-[#F9C80E] text-[#0C1B33] font-black text-sm px-6 h-14 rounded-[6px] hover:bg-[#eac00d] transition-all font-plus-jakarta uppercase tracking-widest">
                            Subscribe
                        </button>
                    </form>
                </div>
            </div>

            {/* Trending / Featured Card */}
            <div className="p-8 bg-slate-50 rounded-[10px] border border-slate-100 space-y-8">
                <div className="flex items-center gap-2 text-[#00A2FF]">
                    <TrendingUp className="h-5 w-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest font-plus-jakarta">Trending Insights</span>
                </div>
                <div className="space-y-6">
                    {[
                        "Optimizing for Threads Search",
                        "AES-256 Encryption Standards",
                        "Creator ROI Benchmarks 2026"
                    ].map((item, i) => (
                        <div key={i} className="group cursor-pointer">
                            <h4 className="text-sm font-bold text-[#0C1B33] leading-snug group-hover:text-[#00A2FF] transition-colors font-plus-jakarta">{item}</h4>
                            <div className="flex items-center gap-2 mt-2 text-[9px] font-black text-slate-400 uppercase tracking-widest font-inter">
                                <span>Article</span>
                                <span>•</span>
                                <span>5m read</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA App Promotion */}
            <div className="p-8 bg-white border border-slate-100 rounded-[10px] shadow-subtle text-center space-y-6">
                <h3 className="text-xl font-extrabold text-[#0C1B33] font-plus-jakarta uppercase leading-tight">Ready to <span className="text-[#00A2FF]">scale</span>?</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed font-inter">Join 12,500+ professionals using the SocialHub command center.</p>
                <Link href="/auth/register" className="block">
                    <Button className="w-full bg-[#0C1B33] text-[#F9C80E] font-black uppercase tracking-widest text-xs h-14 rounded-[6px] hover:bg-[#0C1B33]/90 shadow-subtle transition-transform hover:-translate-y-1 font-plus-jakarta">
                        Start Free Now
                    </Button>
                </Link>
            </div>
        </aside>
    );
}
