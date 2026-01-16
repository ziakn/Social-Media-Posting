"use client";

import { ShieldCheck, Cpu, Globe, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ReliabilitySection() {
    return (
        <section id="reliability" className="py-32 bg-[#0C1B33] text-white relative overflow-hidden font-inter">
            <div className="container mx-auto px-6 max-w-[1280px] relative z-10">
                <div className="grid lg:grid-cols-2 gap-24 items-center">
                    <div className="space-y-10">
                        <h2 className="text-4xl md:text-6xl font-extrabold font-plus-jakarta tracking-tight leading-[0.9] uppercase">
                            Engineered for <br /> <span className="text-[#00A2FF]">Enterprise Scale</span>
                        </h2>
                        <p className="text-xl text-slate-400 font-medium leading-relaxed font-inter">
                            We don't just post content; we secure it. Our infrastructure is built for 100% reliability, global scale, and strict compliance protocols.
                        </p>

                        <div className="grid grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#F9C80E]">
                                    <ShieldCheck className="h-6 w-6" />
                                </div>
                                <h4 className="text-sm font-black uppercase tracking-widest text-white font-plus-jakarta">Token Protection</h4>
                                <p className="text-xs text-slate-500 font-bold font-inter leading-relaxed">AES-256 GCM encryption at rest for every platform node and credential.</p>
                            </div>
                            <div className="space-y-4">
                                <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#00A2FF]">
                                    <Cpu className="h-6 w-6" />
                                </div>
                                <h4 className="text-sm font-black uppercase tracking-widest text-white font-plus-jakarta">Microservice Sync</h4>
                                <p className="text-xs text-slate-500 font-bold font-inter leading-relaxed">Async event-driven architecture handles 100k+ concurrent posting triggers.</p>
                            </div>
                        </div>

                        <Link href="/about#trust" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#00A2FF] hover:text-white transition-colors pt-6 font-plus-jakarta">
                            Visit Technical Trust Center <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-6 relative">
                        <div className="absolute inset-0 bg-[#00A2FF]/5 blur-[120px] pointer-events-none" />
                        {[
                            { label: "Global Uptime", value: "99.99%", desc: "Cloud-Edge Infrastructure" },
                            { label: "API Latency", value: "&lt; 180ms", desc: "Native Platform Sync" },
                            { label: "Daily Backups", value: "Every 2h", desc: "Redundant Storage Nodes" },
                            { label: "Compliance", value: "DPA/DMARC", desc: "Authorized Protocol" }
                        ].map((stat, i) => (
                            <div key={i} className="p-8 bg-white/5 border border-white/10 rounded-xl space-y-3 backdrop-blur-sm group hover:border-white/20 transition-all">
                                <Globe className="h-5 w-5 text-[#27C93F] transition-transform group-hover:rotate-12" />
                                <div className="text-3xl font-black font-plus-jakarta tracking-tighter text-white">{stat.value}</div>
                                <div className="space-y-1">
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</div>
                                    <div className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">{stat.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
