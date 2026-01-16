import Link from "next/link";
import {
    BarChart3,
    Zap,
    Sparkles,
    Layers,
    MessageSquare,
    Users,
    CheckCircle2,
    ArrowRight,
    ShieldCheck,
    Clock,
    Layout
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const metadata = {
    title: "Features of Multi-Platform Social Media Scheduler | SocialHub",
    description: "Explore AI-powered scheduling, analytics, unified inbox, and multi-platform publishing in one tool.",
};

const modules = [
    {
        icon: <Layers className="h-5 w-5" />,
        name: "Unified Media Library",
        desc: "A professional digital asset management hub optimized for high-res social media files. Auto-tags every asset for instant team discovery.",
        features: ["S3 Cloud Storage", "Auto-Tagging", "Version Control"]
    },
    {
        icon: <Sparkles className="h-5 w-5" />,
        name: "AI Media Lab",
        desc: "Automatically resize videos for vertical networks like TikTok. Generate captions and trend-driven hashtags using 2026-grade models.",
        features: ["Auto-Reframing", "Voice-to-Text", "Smart Captions"]
    },
    {
        icon: <MessageSquare className="h-5 w-5" />,
        name: "Unified Inbox",
        desc: "Aggregate every comment, DM, and mention into a single high-velocity stream with sentiment analysis and quick-response tools.",
        features: ["Cross-platform DMs", "Sentiment Detection", "Team Routing"]
    },
    {
        icon: <BarChart3 className="h-5 w-5" />,
        name: "Unified Analytics",
        desc: "Normalize your growth metrics. Compare your TikTok growth against LinkedIn engagement in one authorized, consolidated view.",
        features: ["Normalized ROI", "Global Heatmaps", "Automated Exports"]
    },
    {
        icon: <Clock className="h-5 w-5" />,
        name: "Smart Scheduler",
        desc: "Queue content across 9+ platforms simultaneously. Our engine identifies peak windows for each specific network based on live signals.",
        features: ["Peak-Time Detection", "Batch Imports", "Queue Protection"]
    },
    {
        icon: <Users className="h-5 w-5" />,
        name: "Team Governance",
        desc: "Built for agencies. Secure role-based access control (RBAC), approval multi-step workflows, and client-facing oversight.",
        features: ["Granular Permissions", "DPA Compliance", "Review Loops"]
    }
];

export default function ProductPage() {
    return (
        <div className="bg-white pt-32 pb-24 font-plus-jakarta text-[#3E4652]">
            <div className="container mx-auto px-6 max-w-[1280px]">
                {/* --- Hero --- */}
                <div className="max-w-4xl mx-auto text-center mb-32 space-y-6">
                    <Badge className="bg-slate-50 text-[#00A2FF] border-[#E1E7EF] uppercase tracking-[0.2em] text-[10px] px-4 py-1.5 font-black">Platform Infrastructure</Badge>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-[#0C1B33] tracking-tighter leading-none font-plus-jakarta uppercase">
                        All the Features You Need to <span className="text-[#00A2FF]">Scale</span> Your Social Media
                    </h1>
                    <p className="text-xl text-[#3E4652] font-medium leading-relaxed max-w-2xl mx-auto">
                        One command center. Zero platform toggling. SocialHub translates complex network dynamics into a single, professional engineering workflow.
                    </p>
                </div>

                {/* --- Workflow (Real UI Mockup Style) --- */}
                <div className="mb-40 p-12 bg-[#F5F8FB] rounded-[10px] border border-[#E1E7EF] relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 right-0 w-1/4 h-full bg-[#00A2FF]/5 blur-3xl pointer-events-none" />
                    <div className="text-center mb-20 space-y-2">
                        <h2 className="text-2xl font-extrabold text-[#0C1B33] font-plus-jakarta uppercase tracking-tight">The Unified Flow</h2>
                        <div className="w-12 h-1 bg-[#00A2FF] mx-auto" />
                    </div>

                    <div className="grid md:grid-cols-4 gap-8 relative z-10">
                        {[
                            { step: "01", name: "Consolidate", icon: <Layers className="h-5 w-5" />, desc: "Centralize all raw media files." },
                            { step: "02", name: "Optimize", icon: <Sparkles className="h-5 w-5" />, desc: "AI-powered resizing/captions." },
                            { step: "03", name: "Distribute", icon: <Clock className="h-5 w-5" />, desc: "Queue for the global peak." },
                            { step: "04", name: "Evaluate", icon: <BarChart3 className="h-5 w-5" />, desc: "Measure normalized impact." }
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col items-center text-center space-y-6 group">
                                <div className="w-16 h-16 bg-white border border-[#E1E7EF] rounded-lg flex items-center justify-center text-[#0C1B33] shadow-sm group-hover:bg-[#0C1B33] group-hover:text-[#F9C80E] transition-all duration-300">
                                    {item.icon}
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-[#00A2FF] uppercase tracking-widest">Stage {item.step}</span>
                                    <h4 className="text-lg font-extrabold text-[#0C1B33] font-plus-jakarta uppercase">{item.name}</h4>
                                    <p className="text-sm font-medium text-slate-500 max-w-[180px]">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <span className="sr-only">Visual workflow diagram showing transition from media consolidation to optimization, distribution, and evaluation.</span>
                </div>

                {/* --- Feature Grid (Module Focus) --- */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-40">
                    {modules.map((m, i) => (
                        <div key={i} className="p-10 rounded-[10px] bg-white border border-[#E1E7EF] shadow-subtle hover:-translate-y-1 hover:border-[#00A2FF] transition-all duration-300 flex flex-col group">
                            <div className="w-12 h-12 bg-[#F5F8FB] rounded-lg flex items-center justify-center mb-10 text-[#0C1B33] group-hover:bg-[#0C1B33] group-hover:text-[#F9C80E] transition-colors">
                                {m.icon}
                            </div>
                            <h2 className="text-xl font-extrabold text-[#0C1B33] mb-6 font-plus-jakarta uppercase tracking-tight">{m.name}</h2>
                            <p className="text-[#3E4652] font-medium leading-relaxed mb-10 flex-1">{m.desc}</p>
                            <div className="flex flex-wrap gap-2 pt-8 border-t border-slate-50">
                                {m.features.map((f, idx) => (
                                    <span key={idx} className="bg-slate-50 text-slate-400 font-black text-[9px] tracking-widest uppercase px-3 py-1 rounded-full">{f}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* UI Showcase (Rule: No abstract art) --- */}
                <div className="mb-40 grid lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-8">
                        <Badge className="bg-[#0C1B33] text-white uppercase text-[9px] px-3 font-black">Authorized API Connections</Badge>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-[#0C1B33] font-plus-jakarta tracking-tighter leading-tight">Native connectivity <br /> that passes audit.</h2>
                        <p className="text-lg font-medium leading-relaxed">
                            We don't use scrapes or brittle workarounds. SocialHub uses officially authorized OAuth 2.0 flows for every connected platform, ensuring your data remains secure and compliant with network terms.
                        </p>
                        <div className="space-y-4">
                            {[
                                "Direct ByteDance (TikTok) Integration",
                                "Official Meta Business API access",
                                "Google YouTube Data API v3",
                                "Authenticated LinkedIn Posting"
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 items-center font-bold text-[#0C1B33]">
                                    <CheckCircle2 className="h-5 w-5 text-[#00A2FF]" />
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Real UI Mockup Construction */}
                    <div className="bg-[#F5F8FB] border border-[#E1E7EF] p-4 rounded-[10px] shadow-2xl relative overflow-hidden group">
                        <div className="bg-white border border-[#E1E7EF] rounded-lg h-[400px] shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-10 bg-slate-50 border-b border-[#E1E7EF] flex items-center px-4 gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                            </div>
                            <div className="p-8 pt-16 space-y-6">
                                <div className="flex justify-between items-center">
                                    <div className="h-4 w-1/3 bg-slate-100 rounded-full" />
                                    <div className="h-8 w-1/4 bg-[#0C1B33] rounded-md" />
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    {[1, 2, 3, 4, 5, 6].map(i => (
                                        <div key={i} className="aspect-square bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center">
                                            <Zap className="h-4 w-4 text-slate-200" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {/* Status Overlay */}
                        <div className="absolute bottom-10 right-10 bg-[#28C76F] text-white px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl animate-pulse">
                            9 Platforms Syncing...
                        </div>
                        <span className="sr-only">Screenshot of unified media library and supported platform integrations including TikTok, Meta, Google, and LinkedIn.</span>
                    </div>
                </div>

                {/* --- Final CTA --- */}
                <div className="bg-[#0C1B33] rounded-[10px] p-12 md:p-24 text-center text-white relative overflow-hidden">
                    <h3 className="text-4xl md:text-6xl font-extrabold text-white tracking-tighter mb-10 font-plus-jakarta">Scale your digital <br /> output today.</h3>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Link href="/auth/register">
                            <button className="bg-[#F9C80E] text-[#0C1B33] rounded-[6px] px-12 h-16 font-black text-lg hover:bg-[#eac00d] transition-all shadow-subtle hover:-translate-y-0.5 active:scale-95">
                                Start Free Trial
                            </button>
                        </Link>
                        <Link href="/pricing">
                            <button className="border-2 border-white/20 text-white rounded-[6px] px-12 h-16 font-bold text-lg hover:bg-white/5 transition-all hover:-translate-y-0.5">
                                View Full Pricing
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div >
    );
}
