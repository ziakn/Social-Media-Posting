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
    CheckCircle2,
    Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import BackgroundCanvas from "@/components/home/BackgroundCanvas";
import NewFooter from "@/components/home/NewFooter";

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
                { name: "Slack", desc: "Get real-time notifications for post approvals and comments.", icon: <Slack className="h-6 w-6 text-[#4A154B]" /> },
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
                            Platform Ecosystem
                        </span>
                        <h1 className="text-5xl md:text-[5rem] font-[650] text-[#2d253b] tracking-[-0.03em] leading-[1.1] max-w-4xl mx-auto">
                            Connect Your <br />
                            <span className="bg-gradient-to-br from-[#5e4a7a] to-[#3a2e4a] bg-clip-text text-transparent font-bold">Favorite Tools.</span>
                        </h1>
                        <p className="text-xl text-[#4a3d58] font-[420] max-w-2xl mx-auto leading-relaxed">
                            Supercharge your workflow by integrating <span className="font-bold">UNI.social</span> with the platforms you already use. Simplify your creation and distribution process.
                        </p>
                    </div>
                </section>

                {/* 🔍 Search & Filter Bar */}
                <section className="-mt-12 relative z-30">
                    <div className="container mx-auto px-6 max-w-[800px]">
                        <div className="bg-[rgba(255,255,255,0.6)] backdrop-blur-[20px] rounded-[24px] shadow-2xl border border-[rgba(255,255,255,0.8)] p-6 flex items-center gap-4 group transition-all focus-within:ring-2 focus-within:ring-[#5e4a7a]/20">
                            <Search className="h-6 w-6 text-[#5e4a7a]/40 ml-2" />
                            <input
                                placeholder="Search for an integration..."
                                className="flex-1 bg-transparent outline-none font-[420] text-[#2d253b] text-lg placeholder:text-[#4a3d58]/30"
                            />
                        </div>
                    </div>
                </section>

                {/* 🧩 Integrations Grid */}
                <section className="py-32">
                    <div className="container mx-auto px-6 max-w-[1280px] space-y-24">
                        {categories.map((category, idx) => (
                            <div key={idx} className="space-y-12">
                                <div className="flex items-center gap-6">
                                    <h2 className="text-2xl font-[650] text-[#2d253b] uppercase tracking-tight">{category.name}</h2>
                                    <div className="h-px bg-gradient-to-r from-[rgba(110,85,145,0.2)] to-transparent flex-1" />
                                </div>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {category.integrations.map((item, i) => (
                                        <div key={i} className="bg-[rgba(255,255,255,0.4)] backdrop-blur-[12px] p-8 rounded-[32px] border border-[rgba(255,255,255,0.6)] hover:shadow-xl transition-all duration-300 group flex flex-col justify-between shadow-lg hover:-translate-y-1 min-h-[260px]">
                                            <div className="space-y-6">
                                                <div className="w-16 h-16 rounded-[20px] bg-white/60 flex items-center justify-center border border-[rgba(110,85,145,0.1)] group-hover:bg-[#2d253b] transition-all duration-300 shadow-sm">
                                                    <div className="group-hover:text-white transition-colors duration-300">
                                                        {item.icon}
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <h3 className="text-xl font-bold text-[#2d253b]">{item.name}</h3>
                                                    <p className="text-[0.95rem] text-[#4a3d58] font-[420] leading-relaxed line-clamp-2">{item.desc}</p>
                                                </div>
                                            </div>
                                            <div className="pt-6 border-t border-[rgba(110,85,145,0.1)] flex items-center justify-between mt-auto">
                                                <span className="bg-[#5e4a7a]/10 text-[#5e4a7a] text-[0.65rem] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-[#5e4a7a]/20">Live Now</span>
                                                <button className="text-[#2d253b] font-bold text-[0.7rem] uppercase tracking-widest flex items-center gap-2 hover:text-[#5e4a7a] transition-colors group/link">
                                                    Learn More <ArrowRight className="h-3.5 w-3.5 transform transition-transform group-hover/link:translate-x-1" />
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
                    <div className="bg-gradient-to-br from-[#5e4a7a] to-[#2d253b] rounded-[40px] p-12 md:p-24 text-center text-white space-y-12 relative overflow-hidden shadow-2xl group">
                        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 blur-[120px] pointer-events-none" />
                        <div className="relative z-10 w-20 h-20 bg-white/10 border border-white/20 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-float">
                            <Plus className="h-10 w-10 text-white group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <h2 className="text-4xl md:text-[4rem] font-[650] tracking-[-0.03em] max-w-3xl mx-auto leading-tight relative z-10">
                            Missing an <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent italic px-2">Integration?</span>
                        </h2>
                        <p className="text-xl text-white/80 font-[420] max-w-2xl mx-auto relative z-10">
                            We are constantly expanding our ecosystem. If there's a tool you'd love to see connected, let our team know.
                        </p>
                        <div className="pt-6 relative z-10">
                            <Link href="/contact">
                                <button className="bg-white text-[#2d253b] font-bold text-[0.95rem] px-12 py-6 rounded-[20px] hover:bg-white/90 transition-all shadow-xl hover:-translate-y-1 active:scale-95 uppercase tracking-widest flex items-center gap-3 mx-auto justify-center">
                                    Request Access <ArrowRight className="h-5 w-5" />
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
