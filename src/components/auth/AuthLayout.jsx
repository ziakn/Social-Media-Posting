"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import BackgroundCanvas from "@/components/home/BackgroundCanvas";
import NewFooter from "@/components/home/NewFooter";

export default function AuthLayout({ children, title, subtitle, visualTitle, visualFeatures = [] }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center relative font-sans text-[#1e1a2b] overflow-x-hidden py-12 px-4">
            <BackgroundCanvas />

            <div className="relative z-20 w-full max-w-[1200px] flex flex-col lg:flex-row gap-8 items-stretch">
                {/* Left Section: Visual / Marketing (Integrated) */}
                <div className="lg:w-1/2 flex flex-col justify-center p-8 md:p-12 glass-panel rounded-[40px] border border-[rgba(255,255,255,0.6)]">
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(225,215,245,0.4)] backdrop-blur-[4px] border border-[rgba(255,255,255,0.5)] mb-8 w-fit">
                            <div className="w-2 h-2 rounded-full bg-[#5e4a7a] animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#4e3d64] font-plus-jakarta">2026 AI Lab Protocol Active</span>
                        </div>

                        <h2 className="text-4xl md:text-5xl font-[650] tracking-[-0.03em] leading-[1.1] text-[#201c2b] mb-8 font-plus-jakarta">
                            {visualTitle || (
                                <>
                                    <span className="bg-gradient-to-br from-[#5e4a7a] to-[#3a2e4a] bg-clip-text text-transparent font-bold">Scale your influence</span>
                                    <br />with intelligence.
                                </>
                            )}
                        </h2>

                        <ul className="space-y-4">
                            {(visualFeatures.length > 0 ? visualFeatures : [
                                "Multi-platform scheduling across every major node.",
                                "AI-powered resonance optimization for peak window triggers.",
                                "Unified analytics tracking your entire social graph."
                            ]).map((feature, i) => (
                                <li key={i} className="flex items-center gap-4 text-[#4a3c60] font-medium text-lg">
                                    <div className="w-7 h-7 rounded-full bg-white/30 flex items-center justify-center text-[#5e4a7a] shrink-0 border border-white/40">
                                        <CheckCircle2 className="h-4 w-4" />
                                    </div>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Right Section: Form */}
                <div className="flex-1 flex flex-col justify-center p-8 md:p-12 glass-panel rounded-[40px] border border-[rgba(255,255,255,0.6)]">
                    <div className="w-full max-w-[440px] mx-auto">
                        <div className="mb-10 text-center">
                            <h1 className="text-3xl md:text-4xl font-[650] tracking-[-0.03em] leading-tight text-[#201c2b] mb-3 uppercase">
                                {title}
                            </h1>
                            <p className="text-lg text-[#4a3c60] font-[450] tracking-[-0.01em] bg-[rgba(250,245,255,0.45)] py-2 px-6 rounded-[60px] inline-block backdrop-blur-[4px] border border-[rgba(255,255,255,0.5)]">
                                {subtitle}
                            </p>
                        </div>

                        <div className="relative">
                            {children}
                        </div>

                        {/* Trust Microtext */}
                        <div className="mt-12 flex flex-col items-center gap-4 opacity-50">
                            <div className="h-[1px] w-12 bg-[#5e4a7a]/20" />
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4e3d64] text-center">
                                Secure Authentication Protocol v4.0
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Integration */}
            <div className="relative z-30 w-full max-w-[1440px] mx-auto mt-16">
                <NewFooter />
            </div>
        </div>
    );
}
