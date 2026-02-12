import Link from "next/link";
import {
    Calendar, CheckCircle2, Clock, Zap, Rocket, Brain,
    Sparkles, Globe, ArrowRight, Star, Shield, Cpu
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import JsonLdSchema from "@/components/seo/JsonLdSchema";
import BackgroundCanvas from "@/components/home/BackgroundCanvas";
import NewFooter from "@/components/home/NewFooter";

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
        <main className="min-h-screen relative overflow-hidden bg-white selection:bg-[#5e4a7a]/20 font-sans text-[#1e1a2b]">
            <BackgroundCanvas />
            <JsonLdSchema type="WebSite" data={{ "@type": "CreativeWork", "name": "UNI.social Roadmap" }} />

            {/* 🚀 Hero Section */}
            <section className="pt-40 pb-20 relative z-10 text-center px-4">
                <div className="container mx-auto max-w-[1200px]">
                    <div className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-[rgba(94,74,122,0.05)] border border-[rgba(94,74,122,0.15)] mb-10 backdrop-blur-[4px]">
                        <div className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5e4a7a] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5e4a7a]"></span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5e4a7a]">Product Protocol 2026</span>
                    </div>

                    <h1 className="text-5xl md:text-8xl font-bold tracking-[-0.04em] leading-[0.9] mb-8 uppercase italic">
                        Future <br />
                        <span className="bg-gradient-to-br from-[#5e4a7a] to-[#3a2e4a] bg-clip-text text-transparent">Distribution.</span>
                    </h1>

                    <p className="text-xl text-[#4a3d58]/70 font-medium max-w-2xl mx-auto leading-relaxed">
                        Our journey towards an AI-native social ecosystem. <br />
                        <span className="text-[#5e4a7a]">Transparent, ambitious, and focused on your scale.</span>
                    </p>
                </div>
            </section>

            {/* 📍 Timeline Section */}
            <section className="py-24 relative z-10">
                <div className="container mx-auto px-6 max-w-[1200px] relative">
                    {milestones.map((m, i) => (
                        <div key={i} className="mb-24 last:mb-0 relative py-12 px-8 glass-panel rounded-[40px] border border-[rgba(255,255,255,0.6)]">
                            <div className="flex flex-col lg:flex-row gap-8 lg:items-center justify-between mb-12">
                                <div>
                                    <Badge className="bg-[rgba(94,74,122,0.05)] text-[#5e4a7a] border-[rgba(94,74,122,0.1)] uppercase tracking-[0.2em] text-[10px] px-6 py-2 font-bold mb-4 rounded-full">{m.quarter}</Badge>
                                    <h2 className="text-4xl md:text-5xl font-bold text-[#1e1a2b] uppercase tracking-tighter italic">{m.title}</h2>
                                </div>
                                <div className="text-left lg:text-right">
                                    <p className="text-[10px] font-black text-[#5e4a7a] uppercase tracking-[0.3em] opacity-50 mb-1">Sector Status</p>
                                    <p className="text-lg font-bold text-[#3a2e4a] uppercase tracking-tight">{m.status}</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6">
                                {m.items.map((item, idx) => (
                                    <div key={idx} className="bg-[rgba(255,255,255,0.4)] p-8 rounded-[32px] border border-[rgba(160,140,190,0.15)] backdrop-blur-[2px] hover:bg-[rgba(255,255,255,0.6)] hover:border-[#5e4a7a]/30 transition-all duration-500 group flex flex-col h-full">
                                        <div className="w-14 h-14 bg-white/60 rounded-2xl flex items-center justify-center mb-6 border border-[rgba(160,140,190,0.2)] shadow-sm group-hover:scale-110 transition-transform duration-500">
                                            {item.icon}
                                        </div>
                                        <h3 className="text-lg font-bold text-[#1e1a2b] uppercase tracking-tight mb-3">{item.title}</h3>
                                        <p className="text-[13px] text-[#4a3d58]/80 font-medium leading-[1.6]">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 🎯 Journey CTA */}
            <section className="py-32 container mx-auto px-6 max-w-[1200px] relative z-10">
                <div className="glass-panel rounded-[40px] p-12 md:p-24 text-center border border-[rgba(255,255,255,0.6)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-[#5e4a7a]/5 blur-[100px] pointer-events-none" />
                    <Sparkles className="h-20 w-20 text-[#5e4a7a] mx-auto mb-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700 opacity-80" />

                    <h2 className="text-4xl md:text-7xl font-bold tracking-tight max-w-3xl mx-auto leading-[0.9] uppercase italic mb-8">
                        Grow with <br />
                        <span className="bg-gradient-to-br from-[#5e4a7a] to-[#3a2e4a] bg-clip-text text-transparent">The Network.</span>
                    </h2>

                    <p className="text-xl text-[#4a3d58]/70 font-medium max-w-xl mx-auto mb-12 leading-relaxed">
                        Your feedback drives our roadmap. Join thousands of creators shaping the future of social media intelligence.
                    </p>

                    <div className="flex flex-wrap justify-center gap-6">
                        <Link href="/auth/register">
                            <button className="h-[72px] px-14 bg-[#2d253b] text-white rounded-[60px] font-bold text-base uppercase tracking-[0.1em] transition-all hover:bg-[#3e3152] active:scale-[0.98] shadow-xl shadow-[#2d253b]/10 cursor-pointer border-none">
                                Get Started Free
                            </button>
                        </Link>
                        <Link href="/help">
                            <button className="h-[72px] px-14 bg-white/40 text-[#1e1a2b] rounded-[60px] font-bold text-base border border-[rgba(160,140,190,0.3)] uppercase tracking-[0.1em] transition-all hover:bg-white/60 active:scale-[0.98] backdrop-blur-[4px] cursor-pointer">
                                Suggest Feature
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            <NewFooter />
        </main>
    );
}

export const metadata = {
    title: "Product Roadmap | SocialHub - Future of Distribution",
    description: "Explore the upcoming features and milestones for SocialHub. See our plans for AI expansion and global distribution.",
    keywords: [
        "social media roadmap 2026",
        "AI posting features roadmap",
        "future social media tools",
        "SocialHub development plans",
        "social media analytics roadmap"
    ]
};
