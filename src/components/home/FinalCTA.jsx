"use client";

import Link from "next/link";
import { ArrowRight, Zap, Sparkles } from "lucide-react";

export default function FinalCTA() {
    return (
        <section className="py-16 container mx-auto px-6 max-w-[1280px] font-sans">
            <div className="bg-gradient-to-br from-[#5e4a7a] to-[#2d253b] rounded-[40px] p-12 md:p-24 text-center text-white space-y-12 relative overflow-hidden shadow-2xl">
                {/* Background Decorations */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 blur-[120px] pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="space-y-6 relative z-10">
                    <div className="w-16 h-16 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
                        <Sparkles className="h-8 w-8 text-white fill-current" />
                    </div>
                    <h2 className="text-4xl md:text-[3.5rem] font-[650] tracking-[-0.02em] max-w-4xl mx-auto leading-[1.1]">
                        Ready to <span className="text-white">Grow Your Audience</span> Effortlessly?
                    </h2>
                    <p className="text-[1.15rem] text-white/80 font-[420] max-w-2xl mx-auto leading-relaxed">
                        Join 12,000+ creators and professional agencies who use UNI.social to manage and share their content with the world.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8 relative z-10">
                    <Link href="/auth/register">
                        <button className="bg-white text-[#2d253b] font-bold text-[0.95rem] px-12 py-5 rounded-[16px] hover:bg-white/90 transition-all shadow-xl hover:-translate-y-1 active:scale-95 uppercase tracking-widest">
                            Start Posting Free
                        </button>
                    </Link>
                    <Link href="/pricing">
                        <button className="bg-transparent border-2 border-white/30 text-white font-bold text-[0.95rem] px-12 py-5 rounded-[16px] hover:bg-white/10 transition-all hover:border-white/50 hover:-translate-y-1 active:scale-95 flex items-center gap-3 uppercase tracking-widest mx-auto sm:mx-0">
                            View Plans <ArrowRight className="h-5 w-5" />
                        </button>
                    </Link>
                </div>

                <div className="pt-12 text-white/60 font-bold text-[0.7rem] uppercase tracking-[0.15em] relative z-10">
                    No Credit Card Required | Set Up in Seconds | AI Optimization Ready
                </div>
            </div>
        </section>
    );
}
