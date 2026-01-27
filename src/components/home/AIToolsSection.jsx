"use client";

import { Sparkles, Maximize2, Zap, LayoutGrid } from "lucide-react";
import Link from "next/link";

export default function AIToolsSection() {
    return (
        <section className="py-20 bg-white relative overflow-hidden">
            <div className="container mx-auto px-6 max-w-[1280px]">
                <div className="grid lg:grid-cols-2 gap-24 items-center">
                    <div className="space-y-10 order-2 lg:order-1">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3B82F6]/5 border border-[#3B82F6]/10">
                            <Sparkles className="h-4 w-4 text-[#3B82F6]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#3B82F6] font-plus-jakarta">AI-Powered Optimization</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-extrabold text-[#0C1B33] font-plus-jakarta tracking-tight leading-[0.9] uppercase">
                            AI-Driven <br /> Content <span className="text-[#3B82F6]">Enhancement</span>
                        </h2>
                        <p className="text-xl text-[#3E4652] font-medium leading-relaxed font-inter">
                            Take the guesswork out of sharing content. Our AI tools automate the complex parts of posting so you can focus on your brand.
                        </p>

                        <div className="space-y-8">
                            {[
                                { icon: <Zap className="h-6 w-6" />, title: "Automatic Captions", desc: "Generate engaging captions for TikTok, Pinterest, and Instagram that speak directly to your audience." },
                                { icon: <Maximize2 className="h-6 w-6" />, title: "Smart Aspect Ratios", desc: "Easily adapt your videos and images for different platform requirements in just one click." },
                                { icon: <LayoutGrid className="h-6 w-6" />, title: "Intelligent Timing", desc: "Know exactly when to post to maximize your visibility and engagement with followers." }
                            ].map((tool, i) => (
                                <div key={i} className="flex gap-6 group">
                                    <div className="w-12 h-12 shrink-0 rounded-lg bg-slate-50 flex items-center justify-center text-[#0C1B33] group-hover:bg-[#0C1B33] group-hover:text-[#F9C80E] transition-all">
                                        {tool.icon}
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-lg font-extrabold text-[#0C1B33] uppercase tracking-tight font-plus-jakarta">{tool.title}</h4>
                                        <p className="text-slate-500 text-sm font-medium font-inter">{tool.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Link href="/features" className="inline-block pt-6">
                            <button className="bg-[#0C1B33] text-white font-black text-sm px-10 h-16 rounded-[6px] hover:bg-slate-800 transition-all font-plus-jakarta uppercase tracking-widest">
                                See All AI Tools
                            </button>
                        </Link>
                    </div>

                    <div className="flex-1 relative order-1 lg:order-2">
                        <div className="bg-[#0C1B33] rounded-[10px] p-10 md:p-16 text-white relative shadow-2xl overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#3B82F6]/20 blur-[100px] pointer-events-none" />
                            <div className="space-y-8 relative z-10 text-center">
                                <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-sm border border-white/10 group-hover:scale-110 transition-transform">
                                    <Sparkles className="h-10 w-10 text-[#F9C80E]" />
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-2xl font-black uppercase tracking-tight font-plus-jakarta italic underline decoration-[#F9C80E]">LAB V4.0 LIVE</h3>
                                    <p className="text-slate-400 font-medium text-lg font-inter">Running multi-platform metrics analysis... Captions optimized for 94.2% engagement.</p>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-left space-y-4 font-mono text-xs text-[#3B82F6]">
                                    <p>&gt; scan platform metrics...</p>
                                    <p>&gt; identify viral triggers...</p>
                                    <p>&gt; generation successful.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
