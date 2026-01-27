"use client";

import Link from "next/link";
import { Zap } from "lucide-react";

export default function HeroSection() {
    return (
        <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 bg-white overflow-hidden">
            <div className="container mx-auto px-6 max-w-[1280px] flex flex-col lg:flex-row items-center gap-20 relative z-10">
                <div className="flex-1 space-y-8 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-100">
                        <div className="w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#0C1B33] font-plus-jakarta">New: 2026 AI Lab v4.0 live</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-[#0C1B33] tracking-tighter leading-[0.9] font-plus-jakarta uppercase">
                        The Ultimate <span className="text-[#3B82F6]">Multi-Platform</span> Social Media Scheduler
                    </h1>
                    <p className="text-xl text-[#3E4652] font-medium leading-relaxed max-w-[520px] mx-auto lg:mx-0 font-inter">
                        Post, schedule, and analyze content across TikTok, Pinterest, Instagram, and more — all in one AI-powered platform.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4 font-plus-jakarta">
                        <Link href="/auth/register">
                            <button className="bg-[#F9C80E] text-[#0C1B33] font-black text-lg px-10 py-5 rounded-[6px] hover:bg-[#eac00d] transition-all shadow-subtle hover:-translate-y-0.5 active:scale-95 uppercase tracking-widest">
                                Start Posting Free
                            </button>
                        </Link>
                        <Link href="#how-it-works">
                            <button className="bg-white text-[#0C1B33] border-2 border-[#0C1B33] font-bold text-lg px-10 py-5 rounded-[6px] hover:bg-slate-50 transition-all hover:shadow-subtle hover:-translate-y-0.5 active:scale-95 uppercase tracking-tight">
                                See How It Works
                            </button>
                        </Link>
                    </div>
                </div>

                {/* UI Mockup */}
                <div className="flex-1 relative w-full lg:w-auto scale-110 lg:translate-x-12">
                    <div className="bg-slate-50 rounded-[12px] p-2 border border-slate-200 shadow-2xl relative group">
                        <div className="bg-white rounded-[10px] h-[400px] md:h-[500px] overflow-hidden border border-slate-100 relative">
                            <div className="absolute top-0 left-0 right-0 h-12 bg-slate-50 border-b border-slate-100 flex items-center px-6 gap-3">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
                                </div>
                            </div>
                            <div className="p-8 pt-20 grid grid-cols-2 gap-6 opacity-20">
                                <div className="h-32 bg-slate-100 rounded-lg" />
                                <div className="h-32 bg-slate-100 rounded-lg" />
                                <div className="h-64 col-span-2 bg-slate-100 rounded-lg" />
                            </div>
                            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center">
                                <div className="bg-white p-8 rounded-xl shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-700 max-w-[320px] relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#3B82F6]/5 blur-3xl pointer-events-none" />
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-12 h-12 bg-[#0C1B33] rounded-lg flex items-center justify-center text-[#F9C80E]">
                                            <Zap className="h-6 w-6 fill-current" />
                                        </div>
                                        <div>
                                            <span className="block font-black text-sm text-[#0C1B33] uppercase tracking-tight font-plus-jakarta">Auto-Scheduler</span>
                                            <span className="text-[10px] font-bold text-[#3B82F6] uppercase tracking-widest font-plus-jakarta">Optimizing Peak Times</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="h-2 w-full bg-slate-100 rounded-full" />
                                        <div className="h-2 w-3/4 bg-slate-100 rounded-full" />
                                        <div className="h-2 w-1/2 bg-slate-100 rounded-full" />
                                    </div>
                                    <button className="mt-8 w-full py-3 bg-[#3B82F6] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-lg shadow-lg shadow-[#3B82F6]/20 font-plus-jakarta">Publishing Intelligence...</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#3B82F6]/5 to-transparent pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#F9C80E]/5 blur-[120px] rounded-full pointer-events-none" />
        </section>
    );
}
