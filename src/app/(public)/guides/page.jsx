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
    Search,
    Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import BackgroundCanvas from "@/components/home/BackgroundCanvas";
import NewFooter from "@/components/home/NewFooter";
import { cn } from "@/lib/utils";

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
            content: "Link your TikTok, Instagram, and Pinterest accounts through our secure OAuth layer. UNI.social acts as your encrypted command center, ensuring your tokens remain protected with AES-256 standards.",
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
        <main className="flex flex-col min-h-screen relative font-sans">
            <BackgroundCanvas />

            <div className="relative z-20 flex flex-col w-full">
                {/* Header / Hero */}
                <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden">
                    {/* Background Gradients */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                        <div className="absolute top-20 left-10 w-96 h-96 bg-[#5e4a7a]/10 rounded-full blur-[120px]" />
                        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#5e4a7a]/5 rounded-full blur-[120px]" />
                    </div>

                    <div className="container mx-auto px-6 max-w-[1280px] relative z-10">
                        <div className="max-w-4xl space-y-8">
                            <Link href="/portal" className="inline-flex items-center gap-2 text-[0.75rem] font-bold text-[#5e4a7a] uppercase tracking-widest hover:-translate-x-1 transition-transform group">
                                <ArrowRight className="h-4 w-4 rotate-180 group-hover:-translate-x-0.5 transition-transform" /> Back to Dashboard
                            </Link>
                            <h1 className="text-4xl md:text-[5rem] font-[650] text-[#2d253b] leading-[1.1] tracking-[-0.03em]">
                                <span className="bg-gradient-to-br from-[#5e4a7a] to-[#3a2e4a] bg-clip-text text-transparent italic mr-4">UNI.social</span>
                                User Guide <br className="hidden md:block" />
                                <span className="text-[#2d253b]">& Tutorials</span>
                            </h1>
                            <p className="text-xl text-[#4a3d58] font-[420] leading-relaxed max-w-2xl">
                                Master the command center. Learn how to scale your digital voice with step-by-step instructions from our engineering lead.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Main Content Area */}
                <section className="py-20 lg:py-28">
                    <div className="container mx-auto px-6 max-w-[1280px]">
                        <div className="grid lg:grid-cols-12 gap-16 lg:gap-24">

                            {/* Sidebar Navigation */}
                            <aside className="lg:col-span-3 space-y-8 relative z-10">
                                <div className="sticky top-32 space-y-10">
                                    <div className="space-y-6">
                                        <h4 className="text-[0.65rem] font-bold text-[#4a3d58]/60 uppercase tracking-[0.2em] px-4">Guide Categories</h4>
                                        <nav className="space-y-2">
                                            {categories.map((cat, i) => (
                                                <button
                                                    key={i}
                                                    className={cn(
                                                        "flex items-center justify-between w-full px-5 py-4 rounded-[20px] transition-all duration-300 group font-bold tracking-tight active:scale-[0.98]",
                                                        i === 0
                                                            ? "bg-[#5e4a7a] text-white shadow-lg shadow-[#5e4a7a]/20"
                                                            : "text-[#4a3d58] bg-[rgba(255,255,255,0.4)] backdrop-blur-[12px] border border-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.6)]"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <span className={i === 0 ? "text-white" : "text-[#5e4a7a]"}>{cat.icon}</span>
                                                        <span className="text-[0.9rem]">{cat.name}</span>
                                                    </div>
                                                    <span className={cn(
                                                        "text-[0.7rem] font-bold px-2 py-0.5 rounded-md",
                                                        i === 0 ? "bg-white/20 text-white" : "bg-[#5e4a7a]/5 text-[#5e4a7a]/40 group-hover:text-[#5e4a7a]"
                                                    )}>
                                                        {cat.count}
                                                    </span>
                                                </button>
                                            ))}
                                        </nav>
                                    </div>

                                    <div className="p-8 md:p-10 bg-gradient-to-br from-[#5e4a7a] to-[#2d253b] rounded-[32px] text-white space-y-8 shadow-2xl overflow-hidden relative group">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl pointer-events-none group-hover:bg-white/10 transition-colors" />
                                        <div className="relative z-10 space-y-6">
                                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                                                <Zap className="h-6 w-6 text-white fill-current" />
                                            </div>
                                            <div className="space-y-2">
                                                <h5 className="text-[1.2rem] font-bold leading-tight uppercase tracking-tight">Need 1-on-1 scales?</h5>
                                                <p className="text-[0.9rem] text-white/70 font-[420] leading-relaxed">Book a protocol session with our growth engineers.</p>
                                            </div>
                                            <button className="w-full bg-white text-[#2d253b] font-bold text-[0.8rem] uppercase tracking-widest h-14 rounded-[16px] hover:bg-white/90 transition-all shadow-xl hover:-translate-y-1 active:scale-95">
                                                Book Strategy
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </aside>

                            {/* Content Area */}
                            <div className="lg:col-span-9 space-y-24 relative z-10">

                                <div className="space-y-12">
                                    <div className="space-y-6">
                                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-[50px] bg-[#5e4a7a]/5 border border-[#5e4a7a]/10 backdrop-blur-[4px] text-[0.7rem] font-bold uppercase tracking-widest text-[#5e4a7a]">
                                            Getting Started
                                        </span>
                                        <h2 className="text-4xl md:text-[3.5rem] font-[650] text-[#2d253b] tracking-[-0.02em] leading-tight uppercase">The Growth Onboarding Protocol</h2>
                                    </div>

                                    <div className="space-y-10">
                                        {steps.map((step, i) => (
                                            <div key={i} className="group p-8 md:p-12 bg-[rgba(255,255,255,0.4)] backdrop-blur-[12px] border border-[rgba(255,255,255,0.6)] rounded-[40px] shadow-lg hover:shadow-2xl hover:border-[#5e4a7a]/20 transition-all duration-500 relative overflow-hidden group-hover:-translate-y-1">
                                                <div className="absolute -top-12 -right-12 text-[15rem] font-black text-[#5e4a7a]/5 group-hover:text-[#5e4a7a]/10 transition-colors pointer-events-none select-none italic">
                                                    {step.number}
                                                </div>
                                                <div className="relative z-10 space-y-10 max-w-3xl">
                                                    <div className="flex items-center gap-6">
                                                        <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-[#5e4a7a]/10 text-[#5e4a7a] text-[1rem] font-bold border border-[#5e4a7a]/20">
                                                            {step.number}
                                                        </span>
                                                        <h3 className="text-2xl md:text-3xl font-bold text-[#2d253b] tracking-tight uppercase">
                                                            {step.title}
                                                        </h3>
                                                    </div>
                                                    <p className="text-xl leading-relaxed text-[#4a3d58] font-[420]">
                                                        {step.content}
                                                    </p>
                                                    <div className="pt-4">
                                                        <div className="aspect-video bg-white/40 border border-[rgba(110,85,145,0.1)] rounded-[32px] flex items-center justify-center group-hover:bg-white/60 transition-all duration-500 overflow-hidden relative shadow-inner">
                                                            <div className="absolute inset-0 bg-gradient-to-br from-[#5e4a7a]/5 to-transparent pointer-events-none" />
                                                            <div className="w-20 h-20 rounded-[24px] bg-white shadow-2xl flex items-center justify-center text-[#5e4a7a] transition-transform duration-500 group-hover:scale-110 hover:shadow-[0_0_30px_rgba(94,74,122,0.3)] cursor-pointer">
                                                                <Play className="h-8 w-8 ml-1 fill-current" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Section: Feature Link CTA */}
                                <div className="bg-gradient-to-br from-[#5e4a7a] to-[#2d253b] rounded-[40px] p-12 md:p-20 text-center text-white space-y-10 relative overflow-hidden shadow-2xl group">
                                    <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 blur-[120px] pointer-events-none group-hover:bg-white/10 transition-colors" />

                                    <div className="relative z-10 space-y-10">
                                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-[50px] bg-white/10 border border-white/20 backdrop-blur-[4px]">
                                            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                            <span className="text-[0.7rem] font-bold uppercase tracking-widest text-white">Scale Now</span>
                                        </div>
                                        <h4 className="text-3xl md:text-[3.5rem] font-[650] tracking-[-0.03em] uppercase leading-[1.1] max-w-3xl mx-auto">
                                            Ready to execute your <br /> <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent italic px-2">Multi-platform strategy?</span>
                                        </h4>
                                        <Link href="/features" className="inline-block">
                                            <button className="bg-white text-[#2d253b] font-bold text-[1rem] px-12 py-6 rounded-[20px] hover:bg-white/90 transition-all shadow-xl hover:-translate-y-1 active:scale-95 uppercase tracking-widest flex items-center gap-3">
                                                Go to Scheduling Tool <ArrowRight className="h-5 w-5" />
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <NewFooter />
            </div>
        </main>
    );
}
