"use client";

import React from "react";
import Link from "next/link";
import { Zap, CheckCircle2 } from "lucide-react";

export default function AuthLayout({ children, title, subtitle, visualTitle, visualFeatures = [] }) {
    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-white font-inter pt-20 lg:pt-0">
            {/* Left Section: Visual / Marketing (60%) */}
            <div className="hidden lg:flex lg:w-3/5 bg-[#0C1B33] relative overflow-hidden flex-col justify-center p-20 pt-32">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-[#3B82F6]/10 to-transparent pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#F9C80E]/10 blur-[120px] rounded-full pointer-events-none" />

                {/* Main Content */}
                <div className="relative z-10 max-w-xl">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-100 mb-8 w-fit">
                        <div className="w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#0C1B33] font-plus-jakarta">2026 AI Lab Protocol Active</span>
                    </div>

                    <h2 className="text-6xl font-extrabold text-white leading-[0.95] mb-10 font-plus-jakarta uppercase tracking-tighter">
                        {visualTitle || <>Scale your <br /><span className='text-[#3B82F6]'>Social Influence</span> <br />with Intelligence.</>}
                    </h2>

                    <ul className="space-y-6">
                        {(visualFeatures.length > 0 ? visualFeatures : [
                            "Multi-platform scheduling across every major node.",
                            "AI-powered resonance optimization for peak window triggers.",
                            "Unified analytics tracking your entire social graph."
                        ]).map((feature, i) => (
                            <li key={i} className="flex items-center gap-4 text-slate-300 font-medium text-lg">
                                <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-[#F9C80E] shrink-0 border border-white/10">
                                    <CheckCircle2 className="h-4 w-4" />
                                </div>
                                {feature}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Right Section: Form (40%) */}
            <div className="flex-1 flex flex-col justify-center p-6 lg:p-20 bg-white relative">
                {/* Decorative sub-bg */}
                <div className="absolute inset-0 bg-slate-50/50 pointer-events-none" />

                <div className="w-full max-w-[500px] mx-auto relative z-10">
                    <div className="mb-12 text-center lg:text-left">
                        <h1 className="text-4xl font-extrabold text-[#0C1B33] font-plus-jakarta tracking-tighter mb-4 uppercase leading-none">
                            {title}
                        </h1>
                        <p className="text-lg text-[#3E4652] font-medium leading-[1.4] max-w-[320px] mx-auto lg:mx-0">
                            {subtitle}
                        </p>
                    </div>

                    <div className="bg-white rounded-[12px] p-8 md:p-10 shadow-subtle border border-slate-100">
                        {children}
                    </div>

                    {/* Trust Microtext */}
                    <div className="mt-10 flex flex-col items-center gap-4 opacity-40">
                        <div className="h-[1px] w-12 bg-slate-200" />
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0C1B33] text-center">
                            Secure Authentication Protocol v4.0
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
