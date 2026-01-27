"use client";

import Link from "next/link";
import {
    Zap,
    CheckCircle2,
    Settings,
    Shield,
    Smartphone,
    Rocket,
    Clock,
    ArrowRight,
    Star,
    Layout,
    MessageSquare,
    BarChart3
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ChangelogPage() {
    const changes = [
        {
            month: "January 2026",
            updates: [
                {
                    type: "Feature",
                    title: "Advanced Al Brand Voice",
                    desc: "Train our Al on your specific brand tone for more authentic content generation.",
                    icon: <Star className="h-5 w-5 text-amber-500" />,
                    badgeColor: "bg-amber-50 text-amber-600"
                },
                {
                    type: "Optimization",
                    title: "Fast-Load Analytics",
                    desc: "We've optimized our data pipelines, reducing dashboard load times by over 40%.",
                    icon: <BarChart3 className="h-5 w-5 text-[#3B82F6]" />,
                    badgeColor: "bg-blue-50 text-[#3B82F6]"
                }
            ]
        },
        {
            month: "December 2025",
            updates: [
                {
                    type: "Feature",
                    title: "Unified Inbox v1",
                    desc: "Manage all your social comments and messages in a single, high-speed interface.",
                    icon: <MessageSquare className="h-5 w-5 text-indigo-500" />,
                    badgeColor: "bg-indigo-50 text-indigo-600"
                },
                {
                    type: "Fix",
                    title: "TikTok API Resolution",
                    desc: "Fixed a lingering issue with video metadata imports for scheduled TikTok posts.",
                    icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
                    badgeColor: "bg-emerald-50 text-emerald-600"
                }
            ]
        },
        {
            month: "November 2025",
            updates: [
                {
                    type: "Optimization",
                    title: "Dark Mode UI Overhaul",
                    desc: "A completely refined dark theme with improved contrast and glassmorphism elements.",
                    icon: <Layout className="h-5 w-5 text-[#0C1B33]" />,
                    badgeColor: "bg-slate-100 text-slate-800"
                }
            ]
        }
    ];

    return (
        <main className="bg-white min-h-screen font-inter text-[#3E4652]">
            {/* 🚀 Hero Section */}
            <section className="pt-32 pb-24 bg-[#0C1B33] text-white relative overflow-hidden text-center">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-[#3B82F6]/10 blur-[100px] pointer-events-none" />
                <div className="container mx-auto px-6 max-w-[1280px] relative z-10 space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-4">
                        <div className="w-2 h-2 rounded-full bg-[#F9C80E] animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white font-inter">Continuous Innovation</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold font-plus-jakarta uppercase tracking-tighter leading-none mx-auto max-w-4xl">
                        Evolving <br />
                        <span className="text-[#3B82F6]">with You.</span>
                    </h1>
                    <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
                        Stay up to date with the latest features, improvements, and fixes we've implemented to make your SocialHub experience even better.
                    </p>
                </div>
            </section>

            {/* 📋 Update Feed */}
            <section className="py-32">
                <div className="container mx-auto px-6 max-w-[900px]">
                    <div className="space-y-32">
                        {changes.map((group, idx) => (
                            <div key={idx} className="relative">
                                {/* Month Header */}
                                <div className="sticky top-24 z-20 mb-12">
                                    <div className="inline-block bg-[#0C1B33] text-white font-black text-xs uppercase tracking-[0.2em] px-6 py-3 rounded-full shadow-lg">
                                        {group.month}
                                    </div>
                                </div>

                                {/* Vertical Line for Month Group */}
                                <div className="absolute left-6 top-8 bottom-0 w-px bg-slate-100 hidden md:block" />

                                <div className="space-y-8 md:pl-20">
                                    {group.updates.map((update, uIdx) => (
                                        <div key={uIdx} className="bg-white p-8 rounded-[10px] border border-slate-100 shadow-sm hover:shadow-subtle hover:border-[#3B82F6] transition-all group relative">
                                            {/* Horizontal Connector Line */}
                                            <div className="absolute -left-20 top-1/2 w-20 h-px bg-slate-100 group-hover:bg-[#3B82F6] transition-colors hidden md:block" />

                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                <div className="flex items-start gap-6">
                                                    <div className="w-14 h-14 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-[#0C1B33] transition-colors group-hover:text-[#F9C80E] text-[#0C1B33]">
                                                        {update.icon}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-3">
                                                            <h3 className="text-xl font-extrabold text-[#0C1B33] font-plus-jakarta uppercase tracking-tight">{update.title}</h3>
                                                            <Badge className={`${update.badgeColor} border-none font-black text-[9px] uppercase tracking-widest px-3 py-1`}>
                                                                {update.type}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-base text-slate-500 font-medium leading-relaxed max-w-xl">{update.desc}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 🎯 Community Section */}
            <section className="pb-32 container mx-auto px-6 max-w-[1280px]">
                <div className="bg-[#0C1B33] rounded-[10px] p-12 md:p-24 text-center text-white space-y-12 relative overflow-hidden shadow-subtle group">
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-[#3B82F6]/10 blur-[100px] pointer-events-none" />
                    <Star className="h-16 w-16 text-[#F9C80E] mx-auto group-hover:scale-110 transition-transform duration-500" />
                    <h2 className="text-4xl md:text-6xl font-extrabold font-inter tracking-tighter max-w-2xl mx-auto leading-tight uppercase">
                        Experience the <span className="text-[#3B82F6]">Next Level.</span>
                    </h2>
                    <p className="text-xl text-slate-400 font-medium max-w-xl mx-auto">
                        Don't just read about our growth—be a part of it. Start your free trial today and access all our latest innovations.
                    </p>
                    <div className="pt-4">
                        <Link href="/auth/register">
                            <button className="bg-[#F9C80E] text-[#0C1B33] font-black text-lg px-12 h-20 rounded-[6px] hover:bg-[#eac00d] transition-all shadow-subtle hover:-translate-y-1 font-inter uppercase tracking-widest flex items-center gap-2 mx-auto justify-center">
                                Start Now <ArrowRight className="h-5 w-5" />
                            </button>
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
