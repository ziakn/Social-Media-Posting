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
    ArrowRight,
    Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import BackgroundCanvas from "@/components/home/BackgroundCanvas";
import NewFooter from "@/components/home/NewFooter";

export default function RoadmapPage() {
    const milestones = [
        {
            quarter: "Q1 2026",
            title: "The AI Expansion",
            status: "In Development",
            statusColor: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
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
            statusColor: "text-[#5e4a7a] bg-[#5e4a7a]/10 border-[#5e4a7a]/20",
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
            statusColor: "text-amber-500 bg-amber-500/10 border-amber-500/20",
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
        <main className="flex flex-col min-h-screen relative font-sans">
            <BackgroundCanvas />

            <div className="relative z-20 flex flex-col w-full">
                {/* 🚀 Hero Section */}
                <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden text-center">
                    {/* Background Gradients */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                        <div className="absolute top-20 left-10 w-96 h-96 bg-[#5e4a7a]/10 rounded-full blur-[120px]" />
                        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#5e4a7a]/5 rounded-full blur-[120px]" />
                    </div>

                    <div className="container mx-auto px-6 max-w-[1280px] relative z-10 space-y-8">
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-[50px] bg-[#5e4a7a]/5 border border-[#5e4a7a]/10 backdrop-blur-[4px] text-[0.8rem] font-bold uppercase tracking-widest text-[#5e4a7a]">
                            <div className="w-2 h-2 rounded-full bg-[#5e4a7a] animate-pulse" />
                            Product Roadmap 2026
                        </span>
                        <h1 className="text-5xl md:text-[5rem] font-[650] text-[#2d253b] tracking-[-0.03em] leading-[1.1] max-w-4xl mx-auto">
                            Building the Future, <br />
                            <span className="bg-gradient-to-br from-[#5e4a7a] to-[#3a2e4a] bg-clip-text text-transparent font-bold">Together.</span>
                        </h1>
                        <p className="text-xl text-[#4a3d58] font-[420] max-w-2xl mx-auto leading-relaxed">
                            Transparency is at our core. Explore the upcoming features and milestones we&apos;re working on to help you grow your social presence with <span className="font-bold text-[#2d253b]">UNI.social</span>.
                        </p>
                    </div>
                </section>

                {/* 🛤️ Visual Timeline Section */}
                <section className="py-20 relative overflow-hidden">
                    <div className="container mx-auto px-6 max-w-[1100px] relative">
                        {/* Vertical Line */}
                        <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[rgba(110,85,145,0.2)] to-transparent -translate-x-1/2 z-0 hidden md:block" />

                        <div className="space-y-24 relative z-10">
                            {milestones.map((milestone, idx) => (
                                <div key={idx} className={`flex flex-col md:flex-row items-start gap-8 md:gap-0 ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                                    {/* Date/Quarter side */}
                                    <div className={`md:w-1/2 flex flex-col md:px-12 items-start ${idx % 2 === 0 ? 'md:items-end md:text-right' : 'md:items-start md:text-left'}`}>
                                        <div className={`inline-flex items-center px-4 py-1 rounded-full border text-[0.65rem] font-bold uppercase tracking-widest mb-6 ${milestone.statusColor} backdrop-blur-sm`}>
                                            {milestone.status}
                                        </div>
                                        <h3 className="text-4xl font-[650] text-[#2d253b] tracking-tight mb-2 uppercase">
                                            {milestone.quarter}
                                        </h3>
                                        <p className="text-xl text-[#5e4a7a] font-bold italic mb-6">
                                            {milestone.title}
                                        </p>
                                    </div>

                                    {/* Center Point */}
                                    <div className="absolute left-6 md:left-1/2 w-14 h-14 bg-white border border-[rgba(110,85,145,0.2)] rounded-[20px] -translate-x-1/2 flex items-center justify-center shadow-xl hidden md:flex z-20">
                                        <div className="w-4 h-4 bg-[#5e4a7a] rounded-full animate-pulse shadow-[0_0_15px_rgba(94,74,122,0.4)]" />
                                    </div>

                                    {/* Content side */}
                                    <div className="md:w-1/2 md:px-12 space-y-6">
                                        {milestone.features.map((feature, fIdx) => (
                                            <div key={fIdx} className="bg-[rgba(255,255,255,0.4)] backdrop-blur-[12px] p-8 rounded-[32px] border border-[rgba(255,255,255,0.6)] shadow-lg hover:shadow-xl hover:border-[#5e4a7a]/30 transition-all duration-300 group hover:-translate-y-1">
                                                <div className="flex items-start gap-6">
                                                    <div className="w-12 h-12 rounded-[16px] bg-[#5e4a7a]/10 flex items-center justify-center text-[#5e4a7a] group-hover:bg-[#2d253b] group-hover:text-white transition-all duration-300 flex-shrink-0 shadow-sm border border-[#5e4a7a]/10">
                                                        {feature.icon}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <h4 className="font-bold text-[#2d253b] uppercase tracking-tight text-base leading-tight">{feature.title}</h4>
                                                        <p className="text-[0.9rem] text-[#4a3d58] font-[420] leading-relaxed line-clamp-2 md:line-clamp-none">{feature.desc}</p>
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
                <section className="py-32 container mx-auto px-6 max-w-[1280px]">
                    <div className="bg-gradient-to-br from-[#5e4a7a] to-[#2d253b] rounded-[40px] p-12 md:p-24 text-center text-white space-y-12 relative overflow-hidden shadow-2xl group">
                        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 blur-[120px] pointer-events-none" />

                        <div className="relative z-10 w-20 h-20 bg-white/10 border border-white/20 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-float">
                            <Sparkles className="h-10 w-10 text-white group-hover:scale-110 transition-transform duration-500 fill-current" />
                        </div>

                        <h2 className="text-4xl md:text-[4rem] font-[650] tracking-[-0.03em] max-w-3xl mx-auto leading-tight relative z-10">
                            Shape our <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent italic px-2">Growth Journey.</span>
                        </h2>
                        <p className="text-xl text-white/80 font-[420] max-w-2xl mx-auto relative z-10 leading-relaxed">
                            Your insights drive our innovation. If there&apos;s a feature you&apos;d love to see or an improvement we can make, let our team know.
                        </p>
                        <div className="pt-6 relative z-10">
                            <Link href="/contact" className="inline-block">
                                <button className="bg-white text-[#2d253b] font-bold text-[1rem] px-12 py-6 rounded-[20px] hover:bg-white/90 transition-all shadow-xl hover:-translate-y-1 active:scale-95 uppercase tracking-widest flex items-center gap-3">
                                    Suggest a Feature <ArrowRight className="h-5 w-5" />
                                </button>
                            </Link>
                        </div>
                    </div>
                </section>

                <NewFooter />
            </div>
        </main>
    );
}
