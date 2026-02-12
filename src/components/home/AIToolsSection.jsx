"use client";

import { Sparkles, Maximize2, Zap, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AIToolsSection() {
    return (
        <section className="py-24 relative overflow-hidden font-sans">
            <div className="container mx-auto px-6 max-w-[1280px]">
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    {/* Left Content */}
                    <div className="space-y-10 order-2 lg:order-1">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-[50px] bg-[#5e4a7a]/5 border border-[#5e4a7a]/10 backdrop-blur-[4px]">
                            <Sparkles className="h-4 w-4 text-[#5e4a7a]" />
                            <span className="text-[0.8rem] font-bold uppercase tracking-widest text-[#5e4a7a]">AI-Powered Optimization</span>
                        </div>
                        <h2 className="text-3xl md:text-[2.8rem] font-[650] text-[#2d253b] tracking-[-0.03em] leading-[1.15]">
                            AI-Driven <br /> Content <span className="text-[#5e4a7a]">Enhancement</span>
                        </h2>
                        <p className="text-[1.1rem] text-[#4a3d58] font-[420] leading-relaxed">
                            Take the guesswork out of sharing content. Our AI tools automate the complex parts of posting so you can focus on your brand.
                        </p>

                        <div className="space-y-6">
                            {[
                                { icon: <Zap className="h-5 w-5" />, title: "Automatic Captions", desc: "Generate engaging captions for TikTok, Pinterest, and Instagram that speak directly to your audience." },
                                { icon: <Maximize2 className="h-5 w-5" />, title: "Smart Aspect Ratios", desc: "Easily adapt your videos and images for different platform requirements in just one click." },
                                { icon: <LayoutGrid className="h-5 w-5" />, title: "Intelligent Timing", desc: "Know exactly when to post to maximize your visibility and engagement with followers." }
                            ].map((tool, i) => (
                                <div key={i} className="flex gap-5 group p-4 rounded-[20px] bg-transparent transition-all hover:bg-white/40 hover:backdrop-blur-sm border border-transparent hover:border-white/50">
                                    <div className="w-12 h-12 shrink-0 rounded-[14px] bg-[#5e4a7a]/5 flex items-center justify-center text-[#5e4a7a] group-hover:bg-[#5e4a7a] group-hover:text-white transition-all shadow-sm">
                                        {tool.icon}
                                    </div>
                                    <div className="space-y-1.5">
                                        <h4 className="text-[1.05rem] font-bold text-[#2d253b] tracking-[-0.01em]">{tool.title}</h4>
                                        <p className="text-[#4a3d58] text-[0.95rem] font-normal leading-relaxed">{tool.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Link href="/features" className="inline-block pt-4">
                            <button className="bg-[#2d253b] text-white font-medium text-[0.95rem] px-8 py-4 rounded-[40px] hover:bg-[#3f3155] transition-all shadow-lg shadow-[#2d253b]/10 hover:shadow-[#2d253b]/20 flex items-center gap-2">
                                <Sparkles className="h-4 w-4" /> See All AI Tools
                            </button>
                        </Link>
                    </div>

                    {/* Right Visual - Glassmorphism Card */}
                    <div className="flex-1 relative order-1 lg:order-2">
                        <div className="bg-[rgba(255,255,255,0.25)] backdrop-blur-[12px] rounded-[40px] p-10 md:p-12 border border-[rgba(255,255,255,0.6)] shadow-2xl relative overflow-hidden group hover:bg-[rgba(255,255,255,0.35)] transition-all duration-500">

                            {/* Decorative Background Blur */}
                            <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#5e4a7a]/10 blur-[80px] rounded-full pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#9d84c2]/10 blur-[60px] rounded-full pointer-events-none" />

                            <div className="space-y-8 relative z-10 text-center">
                                <div className="w-24 h-24 bg-white/40 rounded-[24px] flex items-center justify-center mx-auto backdrop-blur-md border border-white/50 shadow-lg group-hover:scale-110 transition-transform duration-500">
                                    <Sparkles className="h-10 w-10 text-[#5e4a7a]" />
                                </div>

                                <div className="space-y-3">
                                    <div className="inline-block px-4 py-1 rounded-full bg-[#5e4a7a] text-white text-[0.7rem] font-bold uppercase tracking-widest mb-2 shadow-md">
                                        LAB V4.0 LIVE
                                    </div>
                                    <h3 className="text-2xl font-bold text-[#2d253b] tracking-tight">System Status: <span className="text-[#27C93F]">Optimal</span></h3>
                                    <p className="text-[#4a3d58] font-medium text-[1.05rem]">Running multi-platform metrics analysis... <br />Captions optimized for <span className="font-bold text-[#5e4a7a]">94.2% engagement</span>.</p>
                                </div>

                                {/* Code Terminal Style Block - Light Theme */}
                                <div className="bg-[#2d253b] rounded-[20px] p-6 text-left space-y-3 font-mono text-xs shadow-inner shadow-black/20 border border-[rgba(255,255,255,0.1)]">
                                    <div className="flex gap-2 mb-4 border-b border-white/10 pb-3">
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]"></div>
                                    </div>
                                    <p className="text-white/60"><span className="text-[#27C93F] mr-2">➜</span>scan platform metrics...</p>
                                    <p className="text-white/60"><span className="text-[#27C93F] mr-2">➜</span>identify viral triggers...</p>
                                    <div className="h-px bg-white/10 my-2"></div>
                                    <p className="text-white font-bold typing-effect"><span className="text-[#27C93F] mr-2">✔</span>generation successful.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
