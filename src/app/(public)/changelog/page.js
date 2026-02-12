import Link from "next/link";
import {
    Clock, Zap, CheckCircle2, Star, Rocket, MessageSquare,
    Share2, Globe, Shield, ArrowRight, Layers, Layout
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ChangelogPage() {
    const logs = [
        {
            month: "February 2026",
            updates: [
                {
                    date: "Feb 12",
                    version: "v4.2.0",
                    title: "Advanced AI Synchronizer",
                    desc: "Launched our proprietary cross-platform media synchronization engine. Seamlessly bridge assets between TikTok, Instagram, and Pinterest with zero quality loss.",
                    tag: "Production",
                    icon: <Zap className="h-5 w-5 text-amber-400" />
                },
                {
                    date: "Feb 05",
                    version: "v4.1.8",
                    title: "BlueSky Native Support",
                    desc: "Fully integrated the AT Protocol for decentralized social connectivity. UNI.social now acts as your primary command center for the open social web.",
                    tag: "Integration",
                    icon: <Globe className="h-5 w-5 text-blue-400" />
                }
            ]
        },
        {
            month: "January 2026",
            updates: [
                {
                    date: "Jan 28",
                    version: "v4.1.0",
                    title: "Unified Analytics Dashboard",
                    desc: "Complete overhaul of the reporting layer. Granular engagement data for every platform, aggregated into a single high-readability index.",
                    tag: "Feature",
                    icon: <Layout className="h-5 w-5 text-purple-400" />
                },
                {
                    date: "Jan 15",
                    version: "v4.0.0",
                    title: "UNI.social v4.0 Release",
                    desc: "The future of social distribution is here. Native AI scheduling, enterprise-grade security, and a brand new high-performance UI.",
                    tag: "Major",
                    icon: <Star className="h-5 w-5 text-amber-500" />
                }
            ]
        },
        {
            month: "December 2025",
            updates: [
                {
                    date: "Dec 20",
                    version: "v3.9.5",
                    title: "Threads API Integration",
                    desc: "Synchronize your conversations and posts on Meta's fastest growing social network with our secure OAuth implementation.",
                    tag: "Integration",
                    icon: <MessageSquare className="h-5 w-5 text-slate-400" />
                }
            ]
        }
    ];

    return (
        <main className="bg-white min-h-screen font-[420] text-slate-600">
            {/* 🚀 Hero Section */}
            <section className="pt-32 pb-24 bg-slate-900 text-white relative overflow-hidden text-center">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/20 blur-[100px] pointer-events-none" />
                <div className="container mx-auto px-6 max-w-[1280px] relative z-10 space-y-8">
                    <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary/10 border border-primary/20 mb-4 shadow-lg shadow-primary/5">
                        <div className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">System Changelog</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-[650] uppercase tracking-tighter leading-none mx-auto max-w-4xl">
                        Latest <br />
                        <span className="text-primary italic">Updates.</span>
                    </h1>
                    <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
                        Stay informed about our latest features, optimizations, and technical milestones. We're building the future of social automation, one commit at a time.
                    </p>
                </div>
            </section>

            {/* 📋 Timeline Section */}
            <section className="py-32 container mx-auto px-6 max-w-[1000px]">
                <div className="space-y-32">
                    {logs.map((month, i) => (
                        <div key={i} className="relative">
                            {/* Sticky Month Header */}
                            <div className="md:sticky md:top-32 md:z-20 mb-12 flex justify-center md:justify-start">
                                <div className="bg-white/80 backdrop-blur-xl border border-slate-100 px-6 py-3 rounded-2xl shadow-xl shadow-primary/5">
                                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest">{month.month}</h2>
                                </div>
                            </div>

                            <div className="space-y-16 pl-4 md:pl-12 border-l border-slate-100 relative ml-4 md:ml-12">
                                {month.updates.map((update, idx) => (
                                    <div key={idx} className="relative group">
                                        {/* Timeline Dot */}
                                        <div className="absolute -left-[2.35rem] top-1.5 w-4 h-4 rounded-full bg-white border-4 border-primary shadow-lg z-10 group-hover:scale-125 transition-transform duration-500" />

                                        <div className="space-y-6">
                                            <div className="flex flex-wrap items-center gap-4">
                                                <span className="text-sm font-black text-primary bg-primary/5 px-3 py-1 rounded-lg uppercase tracking-widest leading-none">
                                                    {update.date}
                                                </span>
                                                <Badge className="bg-slate-900/5 text-slate-400 border-slate-200 uppercase text-[9px] font-black tracking-widest">
                                                    {update.version}
                                                </Badge>
                                                <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 uppercase text-[9px] font-black tracking-widest">
                                                    {update.tag}
                                                </Badge>
                                            </div>

                                            <div className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-500">
                                                <div className="flex items-start gap-6">
                                                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-200/60 shadow-sm flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                                        {update.icon}
                                                    </div>
                                                    <div className="space-y-4">
                                                        <h3 className="text-2xl font-[650] text-slate-900 uppercase tracking-tighter leading-tight">
                                                            {update.title}
                                                        </h3>
                                                        <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-2xl">
                                                            {update.desc}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 🎯 CTA Section */}
            <section className="py-40 container mx-auto px-6 max-w-[1280px]">
                <div className="bg-slate-900 rounded-[40px] p-12 md:p-24 text-center text-white space-y-12 relative overflow-hidden shadow-2xl group">
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/20 blur-[100px] pointer-events-none" />
                    <Rocket className="h-16 w-16 text-primary mx-auto group-hover:scale-110 group-hover:-translate-y-2 transition-transform duration-700" />
                    <h2 className="text-4xl md:text-6xl font-[650] tracking-tighter max-w-2xl mx-auto leading-tight uppercase">
                        Ride the <span className="text-primary italic">Fast Lane.</span>
                    </h2>
                    <p className="text-xl text-slate-400 font-medium max-w-xl mx-auto">
                        Experience the latest features yourself. Create your account and start your social media distribution journey today.
                    </p>
                    <div className="pt-4">
                        <Link href="/auth/register">
                            <button className="bg-white text-slate-900 font-bold text-lg px-12 h-20 rounded-full hover:bg-primary hover:text-white transition-all shadow-xl hover:-translate-y-1 uppercase tracking-widest flex items-center gap-2 mx-auto justify-center active:scale-95">
                                Start Your Journey
                            </button>
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}

export const metadata = {
    title: "Changelog | UNI.social - Latest Features & Updates",
    description: "Stay up to date with the latest features, improvements, and fixes we've implemented at UNI.social.",
};
