import Link from "next/link";
import {
    Calendar, CheckCircle2, Clock, Zap, Rocket, Brain,
    Sparkles, Globe, ArrowRight, Star, Shield, Cpu
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import JsonLdSchema from "@/components/seo/JsonLdSchema";

export default function RoadmapPage() {
    const milestones = [
        {
            quarter: "Q1 2026",
            title: "AI Distribution Engine v2",
            status: "In Progress",
            items: [
                { title: "Smart Scheduling", desc: "AI-driven posting times based on audience engagement data.", icon: <Brain className="h-5 w-5 text-purple-400" /> },
                { title: "Native Video Processing", desc: "Automated transcoding and optimization for TikTok and Reels.", icon: <Zap className="h-5 w-5 text-amber-400" /> },
                { title: "Advanced Analytics", desc: "Deep-dive metrics across all connected platforms in one view.", icon: <Sparkles className="h-5 w-5 text-blue-400" /> }
            ]
        },
        {
            quarter: "Q2 2026",
            title: "Ecosystem Expansion",
            status: "Planned",
            items: [
                { title: "YouTube Integration", desc: "Direct publishing for Shorts and long-form content.", icon: <Rocket className="h-5 w-5 text-red-500" /> },
                { title: "Team Collaboration Hub", desc: "Multi-user workflows with approval layers and permissioning.", icon: <Globe className="h-5 w-5 text-emerald-400" /> },
                { title: "Brand Kits", desc: "Centralized assets for consistent cross-platform branding.", icon: <Star className="h-5 w-5 text-amber-400" /> }
            ]
        },
        {
            quarter: "Q3 2026",
            title: "Enterprise Solutions",
            status: "Researching",
            items: [
                { title: "White-label Portal", desc: "Custom branding for agencies managing multiple clients.", icon: <Shield className="h-5 w-5 text-indigo-400" /> },
                { title: "Global CDN Integration", desc: "Localized media delivery for high-performance distribution.", icon: <Cpu className="h-5 w-5 text-slate-400" /> },
                { title: "Custom API Access", desc: "Extended endpoints for large-scale enterprise automation.", icon: <Zap className="h-5 w-5 text-primary" /> }
            ]
        }
    ];

    return (
        <main className="bg-white min-h-screen font-[420] text-slate-600">
            <JsonLdSchema type="WebSite" data={{ "@type": "CreativeWork", "name": "UNI.social Roadmap" }} />
            {/* 🚀 Hero Section */}
            <section className="pt-32 pb-24 bg-slate-900 text-white relative overflow-hidden text-center">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/20 blur-[100px] pointer-events-none" />
                <div className="container mx-auto px-6 max-w-[1280px] relative z-10 space-y-8">
                    <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary/10 border border-primary/20 mb-4 shadow-lg shadow-primary/5">
                        <div className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Product Roadmap 2026</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-[650] uppercase tracking-tighter leading-none mx-auto max-w-4xl">
                        Future <br />
                        <span className="text-primary italic">Distribution.</span>
                    </h1>
                    <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
                        Our journey towards an AI-native social ecosystem. Transparent, ambitious, and focused on your growth.
                    </p>
                </div>
            </section>

            {/* 📍 Timeline Section */}
            <section className="py-32 relative">
                {/* Vertical Timeline Line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent hidden lg:block" />

                <div className="container mx-auto px-6 max-w-[1000px] relative">
                    {milestones.map((m, i) => (
                        <div key={i} className="mb-32 last:mb-0 relative group">
                            {/* Milestone Marker */}
                            <div className="absolute left-1/2 -top-10 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-4 border-primary shadow-lg z-20 hidden lg:block group-hover:scale-125 transition-transform duration-500" />

                            <div className="text-center mb-12">
                                <Badge className="bg-primary/5 text-primary border-primary/10 uppercase tracking-[0.2em] text-[10px] px-6 py-2 font-bold mb-4">{m.quarter}</Badge>
                                <h2 className="text-3xl font-[650] text-slate-900 uppercase tracking-tighter">{m.title}</h2>
                                <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">{m.status}</p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-8">
                                {m.items.map((item, idx) => (
                                    <div key={idx} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-500 group flex flex-col justify-between h-full">
                                        <div>
                                            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-slate-200/60 shadow-sm italic">
                                                {item.icon}
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight mb-2">{item.title}</h3>
                                            <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 🎯 Journey CTA */}
            <section className="py-40 container mx-auto px-6 max-w-[1280px]">
                <div className="bg-slate-900 rounded-[40px] p-12 md:p-24 text-center text-white space-y-12 relative overflow-hidden shadow-2xl group">
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/20 blur-[100px] pointer-events-none" />
                    <Sparkles className="h-16 w-16 text-primary mx-auto group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700" />
                    <h2 className="text-4xl md:text-6xl font-[650] tracking-tighter max-w-2xl mx-auto leading-tight uppercase">
                        Grow with <span className="text-primary italic">Us.</span>
                    </h2>
                    <p className="text-xl text-slate-400 font-medium max-w-xl mx-auto">
                        Your feedback drives our roadmap. Join thousands of creators shaping the future of social media distribution.
                    </p>
                    <div className="pt-4 flex flex-wrap justify-center gap-6">
                        <Link href="/auth/register">
                            <button className="bg-white text-slate-900 font-bold text-lg px-12 h-20 rounded-full hover:bg-primary hover:text-white transition-all shadow-xl hover:-translate-y-1 uppercase tracking-widest flex items-center gap-2 mx-auto justify-center active:scale-95">
                                Get Started Free
                            </button>
                        </Link>
                        <Link href="/help">
                            <button className="bg-slate-800 text-white font-bold text-lg px-12 h-20 rounded-full border border-white/10 hover:bg-slate-700 transition-all hover:-translate-y-1 uppercase tracking-widest flex items-center gap-2 mx-auto justify-center active:scale-95">
                                Suggest Feature
                            </button>
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}

export const metadata = {
    title: "Product Roadmap | UNI.social - The Future of Social Distribution",
    description: "Explore the upcoming features and milestones for UNI.social. See our plans for AI expansion and global distribution.",
    keywords: [
        "social media roadmap 2026",
        "AI posting features roadmap",
        "future social media tools",
        "UNI.social development plans",
        "social media analytics roadmap"
    ]
};
