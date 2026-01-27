"use client";

import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";

export default function FinalCTA() {
    return (
        <section className="py-16 bg-white container mx-auto px-6 max-w-[1280px]">
            <div className="bg-[#0C1B33] rounded-[10px] p-12 md:p-24 text-center text-white space-y-12 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-[#3B82F6]/10 blur-[120px] pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#F9C80E]/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="space-y-6 relative z-10">
                    <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-8 animate-pulse">
                        <Zap className="h-8 w-8 text-[#F9C80E] fill-current" />
                    </div>
                    <h2 className="text-4xl md:text-7xl font-extrabold font-plus-jakarta tracking-tighter max-w-4xl mx-auto leading-[0.9] uppercase">
                        Ready to <span className="text-[#3B82F6]">Scale</span> Without the Stress?
                    </h2>
                    <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto font-inter">
                        Join 12,500+ creators and professional agencies leveraging the SocialHub command center for high-velocity distribution.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8 relative z-10 font-plus-jakarta">
                    <Link href="/auth/register">
                        <button className="bg-[#F9C80E] text-[#0C1B33] font-black text-xl px-14 h-24 rounded-[6px] hover:bg-[#eac00d] transition-all shadow-xl hover:-translate-y-1 active:scale-95 uppercase tracking-widest">
                            Start Posting Free
                        </button>
                    </Link>
                    <Link href="/pricing">
                        <button className="bg-transparent border-2 border-white/20 text-white font-bold text-xl px-14 h-24 rounded-[6px] hover:bg-white/5 transition-all hover:border-white/40 hover:-translate-y-1 active:scale-95 flex items-center gap-3 uppercase tracking-tight">
                            View Plans <ArrowRight className="h-5 w-5" />
                        </button>
                    </Link>
                </div>

                <div className="pt-12 text-slate-500 font-black text-[10px] uppercase tracking-[0.3em] font-plus-jakarta relative z-10">
                    No Credit Card Required | Zero Latency Setup | 2026 AI Lab Ready
                </div>
            </div>
        </section>
    );
}
