"use client";

import Link from "next/link";
import {
    Share2,
    MessageSquare,
    Calendar,
    PenTool,
    Zap,
    Plus,
    ArrowRight,
    Search,
    Github,
    Slack,
    Chrome,
    Cloud,
    Layout,
    CheckCircle2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function IntegrationsPage() {
    const categories = [
        {
            name: "Social Networks",
            integrations: [
                { name: "Instagram", desc: "Schedule posts, stories, and reels with full analytics.", icon: <Share2 className="h-6 w-6 text-pink-500" /> },
                { name: "TikTok", desc: "Automate your video publishing and track viral trends.", icon: <Zap className="h-6 w-6 text-black" /> },
                { name: "LinkedIn", desc: "Professional networking and company page management.", icon: <ArrowRight className="h-6 w-6 text-blue-700" /> }
            ]
        },
        {
            name: "Team Collaboration",
            integrations: [
                { name: "Slack", desc: "Get real-time notifications for post approvals and comments.", icon: <Slack className="h-6 w-6 text-purple-600" /> },
                { name: "Microsoft Teams", desc: "Keep your entire team aligned with sync'd social updates.", icon: <MessageSquare className="h-6 w-6 text-indigo-600" /> }
            ]
        },
        {
            name: "Content & Design",
            integrations: [
                { name: "Canva", desc: "Design stunning visuals and import them directly to your posts.", icon: <Plus className="h-6 w-6 text-cyan-500" /> },
                { name: "Google Drive", desc: "Access your entire media library from the cloud.", icon: <Cloud className="h-6 w-6 text-blue-500" /> },
                { name: "Figma", desc: "Sync your design assets and branding kits in seconds.", icon: <Layout className="h-6 w-6 text-orange-500" /> }
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
                        <span className="text-[10px] font-black uppercase tracking-widest text-white font-inter">Platform Ecosystem</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold font-plus-jakarta uppercase tracking-tighter leading-none mx-auto max-w-4xl">
                        Connect Your <br />
                        <span className="text-[#3B82F6]">Favorite Tools.</span>
                    </h1>
                    <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
                        Supercharge your workflow by integrating SocialHub with the platforms you already use. Simplify your creation and distribution process.
                    </p>
                </div>
            </section>

            {/* 🔍 Search & Filter Bar */}
            <section className="-mt-8 relative z-20">
                <div className="container mx-auto px-6 max-w-[800px]">
                    <div className="bg-white rounded-xl shadow-2xl border border-slate-100 p-4 flex items-center gap-4">
                        <Search className="h-5 w-5 text-slate-400 ml-2" />
                        <input
                            placeholder="Search for an integration..."
                            className="flex-1 h-12 outline-none font-medium text-[#0C1B33] placeholder:text-slate-300"
                        />
                    </div>
                </div>
            </section>

            {/* 🧩 Integrations Grid */}
            <section className="py-32">
                <div className="container mx-auto px-6 max-w-[1280px] space-y-24">
                    {categories.map((category, idx) => (
                        <div key={idx} className="space-y-12">
                            <div className="flex items-center gap-4">
                                <h2 className="text-2xl font-black text-[#0C1B33] uppercase tracking-tight font-plus-jakarta">{category.name}</h2>
                                <div className="h-px bg-slate-100 flex-1" />
                            </div>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {category.integrations.map((item, i) => (
                                    <div key={i} className="bg-white p-8 rounded-[10px] border border-slate-100 hover:border-[#3B82F6] transition-all group flex flex-col justify-between shadow-sm hover:shadow-subtle min-h-[220px]">
                                        <div className="space-y-6">
                                            <div className="w-14 h-14 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-[#0C1B33] transition-colors">
                                                {item.icon}
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-xl font-bold text-[#0C1B33] font-plus-jakarta">{item.name}</h3>
                                                <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                                            </div>
                                        </div>
                                        <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                            <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px] uppercase tracking-widest px-3">Live Now</Badge>
                                            <button className="text-[#3B82F6] font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:underline">
                                                Learn More <ArrowRight className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 🎯 Request Integration Section */}
            <section className="pb-32 container mx-auto px-6 max-w-[1280px]">
                <div className="bg-[#0C1B33] rounded-[10px] p-12 md:p-24 text-center text-white space-y-12 relative overflow-hidden shadow-subtle group">
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-[#3B82F6]/10 blur-[100px] pointer-events-none" />
                    <Plus className="h-16 w-16 text-[#F9C80E] mx-auto group-hover:scale-110 transition-transform duration-500" />
                    <h2 className="text-4xl md:text-6xl font-extrabold font-inter tracking-tighter max-w-2xl mx-auto leading-tight uppercase">
                        Missing an <span className="text-[#3B82F6]">Integration?</span>
                    </h2>
                    <p className="text-xl text-slate-400 font-medium max-w-xl mx-auto">
                        We are constantly expanding our ecosystem. If there's a tool you'd love to see connected, let our team know.
                    </p>
                    <div className="pt-4">
                        <Link href="/contact">
                            <button className="bg-[#F9C80E] text-[#0C1B33] font-black text-lg px-12 h-20 rounded-[6px] hover:bg-[#eac00d] transition-all shadow-subtle hover:-translate-y-1 font-inter uppercase tracking-widest flex items-center gap-2 mx-auto justify-center">
                                Request Access <ArrowRight className="h-5 w-5" />
                            </button>
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
