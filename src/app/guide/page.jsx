"use client";

import Link from "next/link";
import {
    BookOpen,
    CheckCircle2,
    ArrowRight,
    Zap,
    Play,
    Layout,
    Users,
    BarChart3,
    ShieldCheck,
    Search
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function GuidePage() {
    const categories = [
        { name: "Getting Started", icon: <Play className="h-4 w-4" />, count: 5 },
        { name: "Publishing", icon: <Layout className="h-4 w-4" />, count: 8 },
        { name: "Team Management", icon: <Users className="h-4 w-4" />, count: 4 },
        { name: "Analytics", icon: <BarChart3 className="h-4 w-4" />, count: 6 },
        { name: "Security", icon: <ShieldCheck className="h-4 w-4" />, count: 3 },
    ];

    const steps = [
        {
            number: "01",
            title: "Connect Your Social Nodes",
            content: "Link your TikTok, Instagram, and Pinterest accounts through our secure OAuth layer. SocialHub acts as your encrypted command center, ensuring your tokens remain protected with AES-256 standards.",
            tag: "Setup"
        },
        {
            number: "02",
            title: "Initialize Content Drafting",
            content: "Utilize the 2026 AI Lab v4.0 to generate platform-specific captions and high-resonance hashtags. Our resonance engine analyzes current social entropy to suggest optimal posting windows.",
            tag: "Strategy"
        },
        {
            number: "03",
            title: "Execute Multi-Platform Publishing",
            content: "Schedule your posts across every major network with one click. Hit the peak resonance window automatically, or use our manual override for real-time community engagement.",
            tag: "Action"
        }
    ];

    return (
        <main className="bg-white min-h-screen font-inter text-[#3E4652]">
            {/* Header / Hero */}
            <section className="pt-32 pb-16 bg-[#F5F8FB] border-b border-slate-100">
                <div className="container mx-auto px-6 max-w-[1280px]">
                    <div className="max-w-3xl space-y-6">
                        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black text-[#00A2FF] uppercase tracking-widest hover:-translate-x-1 transition-transform">
                            <ArrowRight className="h-4 w-4 rotate-180" /> Back to Dashboard
                        </Link>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-[#0C1B33] leading-none tracking-tighter font-plus-jakarta uppercase">
                            SocialHub User <br />
                            <span className="text-[#00A2FF]">Guide & Tutorials</span>
                        </h1>
                        <p className="text-xl text-[#3E4652] font-medium leading-relaxed">
                            Master the command center. Learn how to scale your digital voice with step-by-step instructions from our engineering lead.
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content Area */}
            <section className="py-20">
                <div className="container mx-auto px-6 max-w-[1280px]">
                    <div className="grid lg:grid-cols-12 gap-16">

                        {/* Sidebar Navigation */}
                        <aside className="lg:col-span-3 space-y-8">
                            <div className="sticky top-32 space-y-8">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Guide Categories</h4>
                                    <nav className="space-y-1">
                                        {categories.map((cat, i) => (
                                            <button key={i} className={`flex items-center justify-between w-full px-4 py-3 rounded-[6px] transition-all group font-inter uppercase tracking-widest ${i === 0 ? 'bg-white shadow-subtle text-[#0C1B33] border border-slate-100' : 'text-slate-500 hover:bg-slate-50'}`}>
                                                <div className="flex items-center gap-3">
                                                    <span className={i === 0 ? 'text-[#00A2FF]' : 'text-slate-300'}>{cat.icon}</span>
                                                    <span className="text-[10px] font-black">{cat.name}</span>
                                                </div>
                                                <span className="text-[10px] font-black text-slate-300 group-hover:text-[#00A2FF] transition-colors">{cat.count}</span>
                                            </button>
                                        ))}
                                    </nav>
                                </div>

                                <div className="p-8 bg-[#0C1B33] rounded-[10px] text-white space-y-6 shadow-subtle overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#00A2FF]/10 blur-3xl pointer-events-none" />
                                    <Zap className="h-8 w-8 text-[#F9C80E]" />
                                    <h5 className="text-lg font-bold font-inter uppercase leading-tight">Need 1-on-1 scales?</h5>
                                    <p className="text-sm text-slate-400 font-medium">Book a protocol session with our growth engineers.</p>
                                    <button className="w-full bg-[#00A2FF] text-white font-black text-[10px] uppercase tracking-widest h-12 rounded-[6px] hover:bg-[#00A2FF]/90 transition-all">
                                        Book Strategy
                                    </button>
                                </div>
                            </div>
                        </aside>

                        {/* Content Area */}
                        <div className="lg:col-span-9 space-y-20">

                            <div className="space-y-12">
                                <div className="space-y-4">
                                    <Badge className="bg-slate-50 text-[#00A2FF] border-[#E1E7EF] uppercase tracking-[0.2em] text-[10px] px-4 py-1.5 font-black">
                                        Getting Started
                                    </Badge>
                                    <h2 className="text-4xl font-extrabold text-[#0C1B33] font-inter uppercase tracking-tight">The Growth Onboarding Protocol</h2>
                                </div>

                                <div className="space-y-8">
                                    {steps.map((step, i) => (
                                        <div key={i} className="group p-8 md:p-12 bg-white border border-slate-100 rounded-[10px] shadow-sm hover:shadow-subtle hover:border-[#00A2FF]/20 transition-all relative overflow-hidden">
                                            <div className="absolute -top-4 -right-4 text-9xl font-black text-slate-50 group-hover:text-[#00A2FF]/5 transition-colors pointer-events-none">
                                                {step.number}
                                            </div>
                                            <div className="relative z-10 space-y-6 max-w-2xl">
                                                <div className="flex items-center gap-4">
                                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#00A2FF]/10 text-[#00A2FF] text-[10px] font-black font-inter">
                                                        {step.number}
                                                    </span>
                                                    <h3 className="text-2xl font-extrabold text-[#0C1B33] font-inter uppercase tracking-tight">
                                                        {step.title}
                                                    </h3>
                                                </div>
                                                <p className="text-lg leading-relaxed text-[#3E4652] font-medium">
                                                    {step.content}
                                                </p>
                                                <div className="pt-4">
                                                    <div className="aspect-video bg-[#F5F8FB] border border-slate-100 rounded-[6px] flex items-center justify-center group-hover:border-[#00A2FF]/20 transition-all">
                                                        <div className="w-16 h-16 rounded-full bg-white shadow-subtle flex items-center justify-center text-[#00A2FF]">
                                                            <Play className="h-6 w-6 ml-1 fill-current" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Section: Feature Link CTA */}
                            <div className="bg-[#0C1B33] rounded-[10px] p-12 text-center text-white space-y-8 relative overflow-hidden shadow-subtle">
                                <div className="absolute top-0 right-0 w-1/3 h-full bg-[#00A2FF]/10 blur-[100px] pointer-events-none" />
                                <div className="relative z-10 space-y-8">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                                        <div className="w-2 h-2 rounded-full bg-[#00A2FF] animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Scale Now</span>
                                    </div>
                                    <h4 className="text-3xl md:text-5xl font-extrabold font-inter tracking-tighter uppercase leading-none max-w-2xl mx-auto">
                                        Ready to execute your <br /> <span className="text-[#00A2FF]">Multi-platform strategy?</span>
                                    </h4>
                                    <Link href="/features" className="inline-block mt-4">
                                        <button className="bg-[#F9C80E] text-[#0C1B33] font-black text-lg px-12 h-20 rounded-[6px] hover:bg-[#eac00d] transition-all shadow-subtle hover:-translate-y-0.5">
                                            Go to Scheduling Tool
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
