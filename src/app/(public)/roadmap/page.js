"use client";

import Link from "next/link";
import {
    Calendar,
    Zap,
    Users,
    BarChart3,
    MessageSquare,
    Globe,
    Rocket,
    CheckCircle2,
    Clock,
    Plus,
    ArrowRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function RoadmapPage() {
    const milestones = [
        {
            quarter: "Q1 2026",
            title: "The AI Expansion",
            status: "In Development",
            statusColor: "text-emerald-500 bg-emerald-50",
            features: [
                {
                    title: "Advanced AI Generation",
                    desc: "State-of-the-art content generation with personalized brand voice training.",
                    icon: <Zap className="h-5 w-5" />
                },
                {
                    title: "Unified Inbox v2",
                    desc: "A completely redesigned inbox with real-time collaboration and AI-powered replies.",
                    icon: <MessageSquare className="h-5 w-5" />
                }
            ]
        },
        {
            quarter: "Q2 2026",
            title: "Deep Insights & Collaboration",
            status: "Upcoming",
            statusColor: "text-[#3B82F6] bg-blue-50",
            features: [
                {
                    title: "Collaborative Workspaces",
                    desc: "Shared environments for teams and clients with granular permission controls.",
                    icon: <Users className="h-5 w-5" />
                },
                {
                    title: "Predictive Analytics",
                    desc: "AI-driven forecasting for engagement and growth trends across all channels.",
                    icon: <BarChart3 className="h-5 w-5" />
                }
            ]
        },
        {
            quarter: "Q3 2026",
            title: "Global Distribution",
            status: "Researching",
            statusColor: "text-amber-500 bg-amber-50",
            features: [
                {
                    title: "Multi-Region Scheduling",
                    desc: "Automatic time-zone optimization for global audience reach.",
                    icon: <Globe className="h-5 w-5" />
                },
                {
                    title: "Enterprise API Access",
                    desc: "Full-featured API for custom integrations and high-scale automation.",
                    icon: <Rocket className="h-5 w-5" />
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
                        <span className="text-[10px] font-black uppercase tracking-widest text-white font-inter">Product Roadmap 2026</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold font-plus-jakarta uppercase tracking-tighter leading-none mx-auto max-w-4xl">
                        Building the Future, <br />
                        <span className="text-[#3B82F6]">Together.</span>
                    </h1>
                    <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
                        Transparency is at our core. Explore the upcoming features and milestones we're working on to help you grow your social presence.
                    </p>
                </div>
            </section>

            {/* 🛤️ Visual Timeline Section */}
            <section className="py-32">
                <div className="container mx-auto px-6 max-w-[1000px] relative">
                    {/* Vertical Line */}
                    <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-slate-100 -translate-x-1/2 z-0 hidden md:block" />

                    <div className="space-y-24 relative z-10">
                        {milestones.map((milestone, idx) => (
                            <div key={idx} className={`flex flex-col md:flex-row items-start gap-8 md:gap-0 ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                                {/* Date/Quarter side */}
                                <div className="md:w-1/2 flex flex-col md:px-12 items-start md:items-end text-left md:text-right">
                                    <Badge className={`${milestone.statusColor} border-none uppercase tracking-[0.2em] text-[10px] px-4 py-1.5 font-black mb-4`}>
                                        {milestone.status}
                                    </Badge>
                                    <h3 className="text-3xl font-black text-[#0C1B33] font-plus-jakarta uppercase tracking-tight mb-2">
                                        {milestone.quarter}
                                    </h3>
                                    <p className="text-lg text-[#3B82F6] font-bold font-inter italic mb-6">
                                        {milestone.title}
                                    </p>
                                </div>

                                {/* Center Point */}
                                <div className="absolute left-6 md:left-1/2 w-12 h-12 bg-white border border-slate-100 rounded-full -translate-x-1/2 flex items-center justify-center shadow-lg hidden md:flex">
                                    <div className="w-3 h-3 bg-[#3B82F6] rounded-full" />
                                </div>

                                {/* Content side */}
                                <div className="md:w-1/2 md:px-12 space-y-6">
                                    {milestone.features.map((feature, fIdx) => (
                                        <div key={fIdx} className="bg-white p-6 rounded-[10px] border border-slate-100 shadow-sm hover:shadow-subtle hover:border-[#3B82F6] transition-all group">
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-[#3B82F6] group-hover:bg-[#0C1B33] group-hover:text-[#F9C80E] transition-colors flex-shrink-0">
                                                    {feature.icon}
                                                </div>
                                                <div className="space-y-1">
                                                    <h4 className="font-extrabold text-[#0C1B33] uppercase tracking-tight text-sm">{feature.title}</h4>
                                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
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

            {/* 🎯 Engagement Section */}
            <section className="pb-32 container mx-auto px-6 max-w-[1280px]">
                <div className="bg-[#0C1B33] rounded-[10px] p-12 md:p-24 text-center text-white space-y-12 relative overflow-hidden shadow-subtle group">
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-[#3B82F6]/10 blur-[100px] pointer-events-none" />
                    <Plus className="h-16 w-16 text-[#F9C80E] mx-auto group-hover:scale-110 transition-transform duration-500" />
                    <h2 className="text-4xl md:text-6xl font-extrabold font-inter tracking-tighter max-w-2xl mx-auto leading-tight uppercase">
                        Shape our <span className="text-[#3B82F6]">Growth Journey.</span>
                    </h2>
                    <p className="text-xl text-slate-400 font-medium max-w-xl mx-auto">
                        Your insights drive our innovation. If there's a feature you'd love to see or an improvement we can make, let us know.
                    </p>
                    <div className="pt-4">
                        <Link href="/contact">
                            <button className="bg-[#F9C80E] text-[#0C1B33] font-black text-lg px-12 h-20 rounded-[6px] hover:bg-[#eac00d] transition-all shadow-subtle hover:-translate-y-1 font-inter uppercase tracking-widest inline-flex items-center gap-2">
                                Suggest a Feature <ArrowRight className="h-5 w-5" />
                            </button>
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
