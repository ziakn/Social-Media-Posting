"use client";

import Link from "next/link";
import {
    ArrowLeft,
    Clock,
    Calendar,
    User,
    Share2,
    Twitter,
    Linkedin,
    MessageSquare,
    Zap,
    CheckCircle2,
    ArrowRight,
    Tag,
    TrendingUp,
    Github,
    Facebook,
    Share,
    Mail
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function BlogPostContent() {
    const post = {
        title: "The 2026 Social Meta: Decoding Threads and Bluesky Growth",
        category: "Strategy",
        date: "January 12, 2026",
        readTime: "8 min read",
        author: {
            name: "Sarah Chen",
            role: "Social Growth Lead",
            avatar: ""
        },
        image: "/api/placeholder/1200/600",
        imageAlt: "Digital social meta trends 2026 visualization",
    };

    const relatedPosts = [
        {
            title: "Optimizing TikTok Workflows with AI Lab v4.0",
            slug: "ai-lab-v4-optimization",
            image: "/api/placeholder/400/250"
        },
        {
            title: "Security Deep Dive: OAuth 2.0 and Token Protection",
            slug: "security-deep-dive",
            image: "/api/placeholder/400/250"
        }
    ];

    return (
        <article className="bg-white min-h-screen font-inter text-[#3E4652]">
            {/* --- Hero Section --- */}
            <div className="bg-white pt-32 pb-16 relative overflow-hidden">
                <div className="container mx-auto px-6 max-w-[1280px] relative z-10">
                    <div className="max-w-4xl space-y-8">
                        <Link href="/blog" className="inline-flex items-center gap-2 text-[10px] font-black text-[#00A2FF] uppercase tracking-widest hover:-translate-x-1 transition-transform">
                            <ArrowLeft className="h-4 w-4" /> Return to Intelligence
                        </Link>
                        <div className="space-y-6">
                            <Badge className="bg-slate-50 text-[#00A2FF] border-[#E1E7EF] uppercase tracking-[0.2em] text-[10px] px-4 py-1.5 font-black">
                                {post.category}
                            </Badge>
                            <h1 className="text-4xl md:text-6xl font-extrabold text-[#0C1B33] leading-none tracking-tighter font-plus-jakarta uppercase">
                                {post.title}
                            </h1>
                        </div>
                        <div className="flex flex-wrap items-center gap-8 pt-8 border-t border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
                                    <User className="h-6 w-6 text-slate-300" />
                                </div>
                                <div>
                                    <div className="text-sm font-black text-[#0C1B33] uppercase tracking-tight">{post.author.name}</div>
                                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{post.author.role}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <span className="flex items-center gap-2.5"><Calendar className="h-4 w-4 text-[#00A2FF]" /> {post.date}</span>
                                <span className="flex items-center gap-2.5"><Clock className="h-4 w-4 text-[#00A2FF]" /> {post.readTime}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Article Body --- */}
            <div className="container mx-auto px-6 py-16 max-w-[1280px]">
                <div className="grid lg:grid-cols-12 gap-16">

                    {/* Main Content Area */}
                    <div className="lg:col-span-8">
                        {/* Featured Image */}
                        <div className="aspect-[21/9] bg-[#F5F8FB] border border-slate-100 rounded-[10px] overflow-hidden mb-12 shadow-subtle flex items-center justify-center p-20">
                            <Zap className="h-32 w-32 text-slate-200" />
                        </div>

                        {/* Prose Container */}
                        <div className="prose prose-slate max-w-none 
                            prose-headings:text-[#0C1B33] prose-headings:font-extrabold prose-headings:tracking-tighter prose-headings:font-inter prose-headings:uppercase
                            prose-h2:text-3xl prose-h3:text-2xl
                            prose-p:text-lg prose-p:leading-relaxed prose-p:text-[#3E4652] prose-p:font-medium
                            prose-strong:text-[#0C1B33] prose-strong:font-black
                            prose-a:text-[#00A2FF] prose-a:font-black hover:prose-a:text-[#00A2FF]/80 transition-colors">

                            <p className="text-xl leading-relaxed text-[#0C1B33] font-bold mb-10 italic">
                                Decoding the <span className="text-[#00A2FF]">2026 social meta</span> requires a shift from centralized broadcasting to node-based distribution resonance.
                            </p>

                            <h2>The Decentralized Shift</h2>
                            <p>
                                New data from 2026 Q1 audits suggest that social graphs are fragmenting into high-velocity micro-communities. For brands, this means identity-layer protection and automated scaling are no longer competitive advantages—they are baseline requirements.
                            </p>

                            {/* Mid-article CTA Block (Aligned with Homepage) */}
                            <div className="not-prose my-16 bg-[#0C1B33] rounded-[10px] p-12 md:p-16 text-center text-white space-y-8 relative overflow-hidden shadow-subtle">
                                <div className="absolute top-0 right-0 w-1/3 h-full bg-[#00A2FF]/10 blur-[100px] pointer-events-none" />
                                <div className="relative z-10 flex flex-col items-center space-y-8">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                                        <div className="w-2 h-2 rounded-full bg-[#00A2FF] animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white">New: 2026 AI Lab v4.0 live</span>
                                    </div>
                                    <h4 className="text-3xl md:text-5xl font-extrabold font-inter tracking-tighter uppercase leading-none max-w-2xl mx-auto">
                                        Ready to scale without the <span className="text-[#00A2FF]">stress?</span>
                                    </h4>
                                    <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-xl mx-auto">
                                        Automate<br />
                                        your<br />
                                        multi-platform<br />
                                        distribution<br />
                                        with<br />
                                        the<br />
                                        same<br />
                                        infrastructure<br />
                                        used<br />
                                        by<br />
                                        12,500+<br />
                                        professionals.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                        <Link href="/auth/register">
                                            <button className="bg-[#F9C80E] text-[#0C1B33] font-black text-sm px-10 h-16 rounded-[6px] hover:bg-[#eac00d] transition-all shadow-subtle hover:-translate-y-0.5">
                                                Get Started Free
                                            </button>
                                        </Link>
                                        <Link href="/pricing">
                                            <button className="bg-transparent border-2 border-white/20 text-white font-bold text-sm px-10 h-16 rounded-[6px] hover:bg-white/5 transition-all">
                                                View Pricing
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <h2>Operationalizing Distribution</h2>
                            <p>
                                To maintain high-production output across 9+ platforms, teams must leverage AES-256 encrypted credential management and AI-localized caption labs. Manual resizing is a legacy bottleneck.
                            </p>
                            <ul>
                                <li><strong>Node-Based Routing</strong>: Secure your tokens with enterprise-grade infrastructure.</li>
                                <li><strong>AI Resizing</strong>: Instant optimization for TikTok, Threads, and Bluesky.</li>
                                <li><strong>Synchronized Scheduling</strong>: Hit the peak resonance window globally.</li>
                            </ul>
                        </div>

                        {/* End Article CTA */}
                        <div className="mt-20 p-12 bg-slate-50 border border-slate-100 rounded-[10px] text-center space-y-8 shadow-sm">
                            <h3 className="text-3xl font-extrabold text-[#0C1B33] font-inter uppercase tracking-tight">Intelligence for the high-velocity creator.</h3>
                            <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-xl mx-auto">
                                Join the elite cohort of agencies and creators scaling with SocialHub's 2026-grade infrastructure.
                            </p>
                            <Link href="/pricing" className="inline-block">
                                <button className="bg-[#0C1B33] text-[#F9C80E] font-black text-lg px-12 h-20 rounded-[6px] hover:scale-105 transition-all shadow-subtle">
                                    View Pricing Plans
                                </button>
                            </Link>
                        </div>

                        {/* Share & Tags */}
                        <div className="flex flex-wrap items-center justify-between gap-8 py-10 border-t border-slate-100 mt-20">
                            <div className="flex items-center gap-6">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Share Intelligence:</span>
                                <div className="flex gap-3">
                                    {[Twitter, Linkedin, Facebook, Share].map((Icon, i) => (
                                        <button key={i} className="w-12 h-12 rounded-[6px] bg-white border border-slate-100 flex items-center justify-center text-[#0C1B33] hover:bg-[#00A2FF] hover:text-white transition-all shadow-sm">
                                            <Icon className="h-4 w-4" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Tag className="h-4 w-4 text-[#00A2FF]" />
                                <div className="flex gap-3">
                                    {["Strategy", "Network Theory", "Automation"].map((t, i) => (
                                        <span key={i} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t}{i < 2 ? "," : ""}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <aside className="lg:col-span-4 space-y-10">
                        {/* Author Card */}
                        <div className="p-10 bg-white border border-slate-100 rounded-[10px] space-y-8 shadow-subtle">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Intelligence Lead</h4>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
                                    <User className="h-8 w-8 text-slate-200" />
                                </div>
                                <div>
                                    <div className="font-extrabold text-[#0C1B33] text-lg uppercase tracking-tight">{post.author.name}</div>
                                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{post.author.role}</div>
                                </div>
                            </div>
                            <p className="text-sm leading-relaxed text-[#3E4652] font-medium">
                                Sarah Chen translates platform engineering updates into high-resonance social strategies for global teams.
                            </p>
                        </div>

                        {/* Related Posts */}
                        <div className="space-y-8">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">More Intelligence</h4>
                            <div className="space-y-8">
                                {relatedPosts.map((rp, i) => (
                                    <Link key={i} href={`/blog/${rp.slug}`} className="group block space-y-4">
                                        <div className="aspect-[16/9] bg-[#F5F8FB] rounded-[10px] overflow-hidden border border-slate-100 group-hover:border-[#00A2FF] transition-all shadow-sm relative flex items-center justify-center">
                                            <Zap className="h-10 w-10 text-slate-200" />
                                        </div>
                                        <h5 className="font-extrabold text-[#0C1B33] text-lg leading-tight uppercase tracking-tight group-hover:text-[#00A2FF] transition-colors line-clamp-2">
                                            {rp.title}
                                        </h5>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Newsletter Card */}
                        <div className="sticky top-32 p-10 bg-[#0C1B33] rounded-[10px] text-white space-y-8 shadow-subtle overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00A2FF]/10 blur-3xl pointer-events-none" />
                            <div className="relative z-10 space-y-6">
                                <Mail className="h-10 w-10 text-[#F9C80E]" />
                                <h4 className="text-2xl font-extrabold font-inter tracking-tighter uppercase leading-tight">Weekly <br /> Platform Signals.</h4>
                                <p className="text-slate-400 font-medium text-sm leading-relaxed">The high-velocity digest on decentralized social graphs.</p>
                                <Link href="/auth/register" className="block">
                                    <button className="w-full bg-[#F9C80E] text-[#0C1B33] font-black uppercase tracking-widest text-[10px] h-14 rounded-[6px] hover:bg-[#eac00d] transition-all shadow-subtle">
                                        Join for Free
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </aside>

                </div>
            </div>
        </article>
    );
}
