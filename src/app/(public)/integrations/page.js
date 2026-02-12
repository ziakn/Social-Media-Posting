"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Search, Plus, Instagram, Facebook, Twitter, Linkedin,
    Slack, Github, Globe, Zap, Layers, Cpu, Database,
    ArrowRight, MessageSquare, Play, Cloud, Shield
} from "lucide-react";
import { TiktokLogo } from "@/components/icons/TiktokLogo";
import PinterestLogo from "@/components/icons/PinterestLogo";
import { ThreadsLogo } from "@/components/icons/ThreadsLogo";
import { BlueSkyLogo } from "@/components/icons/BlueSkyLogo";
import { XLogo } from "@/components/icons/XLogo";
import { LinkedinLogo } from "@/components/icons/LinkedinLogo";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import JsonLdSchema from "@/components/seo/JsonLdSchema";

export default function IntegrationsPage() {
    const [search, setSearch] = useState("");

    const integrations = [
        {
            category: "Social Networks",
            items: [
                { name: "Instagram", icon: <Instagram className="h-6 w-6" />, status: "Live", desc: "Automate reels, posts, and stories with AI." },
                { name: "TikTok", icon: <TiktokLogo className="h-6 w-6" />, status: "Live", desc: "Native scheduling for the world's fastest growing network." },
                { name: "Pinterest", icon: <PinterestLogo className="h-6 w-6" />, status: "Live", desc: "Visual distribution for long-term traffic growth." },
                { name: "Threads", icon: <ThreadsLogo className="h-6 w-6" />, status: "Live", desc: "Synchronize conversations on Meta's newest platform." },
                { name: "LinkedIn", icon: <LinkedinLogo className="h-6 w-6" />, status: "Live", desc: "Professional distribution for B2B authority." },
                { name: "X (Twitter)", icon: <XLogo className="h-6 w-6" />, status: "Live", desc: "Real-time updates and trending distribution." },
                { name: "BlueSky", icon: <BlueSkyLogo className="h-6 w-6" />, status: "Live", desc: "Decentralized social connectivity." }
            ]
        },
        {
            category: "Productivity & Creation",
            items: [
                { name: "Slack", icon: <MessageSquare className="h-6 w-6" />, status: "Live", desc: "Get real-time alerts for your social distribution." },
                { name: "Google Drive", icon: <Cloud className="h-6 w-6" />, status: "Beta", desc: "Import media directly from your cloud storage." },
                { name: "Canva", icon: <Layers className="h-6 w-6" />, status: "Live", desc: "Design and publish directly to UNI.social." }
            ]
        },
        {
            category: "Developer Tools",
            items: [
                { name: "Webhooks", icon: <Zap className="h-6 w-6" />, status: "Live", desc: "Trigger events in your app when posts go live." },
                { name: "REST API", icon: <Cpu className="h-6 w-6" />, status: "Live", desc: "Full programmatic control over your distribution." },
                { name: "GitHub", icon: <Github className="h-6 w-6" />, status: "Beta", desc: "Automate social updates from your code commits." }
            ]
        }
    ];

    const filteredIntegrations = integrations.map(cat => ({
        ...cat,
        items: cat.items.filter(item =>
            item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.desc.toLowerCase().includes(search.toLowerCase())
        )
    })).filter(cat => cat.items.length > 0);

    return (
        <main className="bg-white min-h-screen font-[420] text-slate-600">
            <JsonLdSchema type="WebSite" data={{ "@type": "CollectionPage", "name": "UNI.social Integrations Catalogue" }} />
            {/* 🚀 Hero Section */}
            <section className="pt-32 pb-24 bg-slate-900 text-white relative overflow-hidden text-center">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/20 blur-[100px] pointer-events-none" />
                <div className="container mx-auto px-6 max-w-[1280px] relative z-10 space-y-8">
                    <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary/10 border border-primary/20 mb-4 shadow-lg shadow-primary/5">
                        <div className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Platform Ecosystem</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-[650] uppercase tracking-tighter leading-none mx-auto max-w-4xl">
                        Universal <br />
                        <span className="text-primary italic">Connectors.</span>
                    </h1>
                    <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
                        Seamlessly bridge your favorite tools with UNI.social's distribution engine. One hub, infinite possibilities.
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-xl mx-auto pt-10">
                        <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 p-2 rounded-2xl shadow-2xl group transition-all focus-within:border-primary/50">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                            <Input
                                type="text"
                                placeholder="Search integrations..."
                                className="h-16 pl-14 bg-transparent border-0 text-lg font-medium text-white placeholder:text-slate-500 focus-visible:ring-0"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* 🧩 Integrations Lists */}
            <section className="py-32 container mx-auto px-6 max-w-[1200px]">
                {filteredIntegrations.map((cat, i) => (
                    <div key={i} className="mb-32 last:mb-0">
                        <div className="flex items-center gap-6 mb-16">
                            <h2 className="text-2xl font-[650] text-slate-900 uppercase tracking-tighter whitespace-nowrap">{cat.category}</h2>
                            <div className="h-px w-full bg-slate-100 bg-gradient-to-r from-slate-200 to-transparent" />
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {cat.items.map((item, idx) => (
                                <div key={idx} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-500 group flex flex-col justify-between h-full relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Badge className={`${item.status === 'Live' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'} uppercase text-[9px] font-black tracking-widest`}>
                                            {item.status}
                                        </Badge>
                                    </div>
                                    <div>
                                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-500 mb-8 border border-slate-200/60 shadow-sm">
                                            {item.icon}
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight mb-4">{item.name}</h3>
                                        <p className="text-slate-500 font-medium leading-relaxed mb-8">{item.desc}</p>
                                    </div>
                                    <button className="flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-widest group-hover:gap-4 transition-all">
                                        Configure <ArrowRight className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </section>

            {/* 🎯 Request CTA */}
            <section className="py-40 container mx-auto px-6 max-w-[1280px]">
                <div className="bg-slate-900 rounded-[40px] p-12 md:p-24 text-center text-white space-y-12 relative overflow-hidden shadow-2xl group">
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/20 blur-[100px] pointer-events-none" />
                    <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary/20">
                        <Plus className="h-10 w-10 text-primary group-hover:rotate-180 transition-transform duration-700" />
                    </div>
                    <h2 className="text-4xl md:text-6xl font-[650] tracking-tighter max-w-2xl mx-auto leading-tight uppercase">
                        Missing an <span className="text-primary italic">App?</span>
                    </h2>
                    <p className="text-xl text-slate-400 font-medium max-w-xl mx-auto">
                        We're constantly expanding our ecosystem. Tell us what you'd like to see next and our team will prioritize it.
                    </p>
                    <div className="pt-4">
                        <Link href="/help">
                            <button className="bg-white text-slate-900 font-bold text-lg px-12 h-20 rounded-full hover:bg-primary hover:text-white transition-all shadow-xl hover:-translate-y-1 uppercase tracking-widest flex items-center gap-2 mx-auto justify-center active:scale-95">
                                Request Integration
                            </button>
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
