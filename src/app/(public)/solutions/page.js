import Link from "next/link";
import {
    Building2,
    Users,
    Sparkles,
    ShoppingBag,
    ArrowRight,
    CheckCircle2,
    ArrowLeft,
    BarChart3,
    MessageSquare,
    Zap,
    Lock,
    Target
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const metadata = {
    title: "Social Media Solutions for Agencies, Creators, and Businesses | UNI.social",
    description: "Automate social media growth for creators, SMBs, and agencies across TikTok, Pinterest, Instagram, and more.",
};

const solutions = [
    {
        icon: <Building2 className="h-6 w-6" />,
        title: "For Agencies: Manage Multiple Clients Efficiently",
        pain: "Scaling client accounts manually is prone to errors, delayed approvals, and fragmented reporting across 10+ PDF files.",
        feature: "Centralized Multi-Account Dashboard with role-based access control and integrated client approval portals.",
        outcome: "60% faster client reporting cycles and zero missed posting windows across all managed accounts.",
        badge: "Most Professional"
    },
    {
        icon: <Target className="h-6 w-6" />,
        title: "For Creators: Grow Organically Without Extra Effort",
        pain: "Managing growth across TikTok, YouTube, and Threads requires constant adaptation of media formats and caption styles.",
        feature: "AI Media Lab v4.0 handles auto-reframing, trending hashtag optimization, and platform-specific formatting.",
        outcome: "Scale to 3 additional platforms overnight without increasing manual workload or production overhead.",
        badge: "Creator Friendly"
    },
    {
        icon: <Users className="h-6 w-6" />,
        title: "For Small Businesses: Zero-Budget Automated Growth",
        pain: "Small teams wearing multiple hats can't afford to spend 2 hours a day logging in and out of different social platforms.",
        feature: "Smart Scheduler uses algorithmic peak-time detection to handle distribution automatically from a single queue.",
        outcome: "Recover 10+ team hours per week while maintaining a consistent digital presence without a dedicated social lead.",
        badge: "Efficiency Focus"
    },
    {
        icon: <ShoppingBag className="h-6 w-6" />,
        title: "For E-commerce: Scale Product Launches Globally",
        pain: "Coordinating product launches across 6+ social networks while maintaining consistent pricing and brand voice in every post.",
        feature: "Unified Media Lab for automated resizing and global caption templates that sync launch schedules in seconds.",
        outcome: "3.5x increase in cross-platform referral traffic and 100% brand voice consistency across global channels.",
        badge: "High Growth"
    }
];

export default function SolutionsPage() {
    return (
        <div className="bg-white pt-32 pb-24 font-[420] text-slate-600">
            <div className="container mx-auto px-6 max-w-[1280px]">
                {/* --- Header --- */}
                <div className="max-w-4xl mx-auto text-center mb-32 space-y-6">
                    <Badge className="bg-primary/5 text-primary border-primary/10 uppercase tracking-[0.2em] text-[10px] px-4 py-1.5 font-bold">Segment Solutions</Badge>
                    <h1 className="text-5xl md:text-7xl font-[650] text-slate-900 tracking-tighter leading-none uppercase">
                        Tailored Solutions for <span className="text-primary italic">Every</span> Social Media User
                    </h1>
                    <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
                        UNI.social solves specific operational bottlenecks for high-growth teams. We move beyond "features" to deliver measurable business outcomes.
                    </p>
                </div>

                {/* --- Solution Cards (Pain -> Feature -> Outcome) --- */}
                <div className="grid lg:grid-cols-2 gap-10 mb-40">
                    {solutions.map((s, i) => (
                        <div key={i} className="bg-white/40 backdrop-blur-md border border-slate-200/60 rounded-3xl p-10 flex flex-col space-y-10 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-500 relative group">
                            <div className="flex justify-between items-start">
                                <div className="w-14 h-14 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-primary/20">
                                    {s.icon}
                                </div>
                                <Badge className="bg-slate-50 text-slate-400 font-bold text-[9px] px-3 py-1 uppercase tracking-widest">{s.badge}</Badge>
                            </div>

                            <div className="space-y-8">
                                <h2 className="text-2xl font-[650] text-slate-900 uppercase tracking-tight leading-none">{s.title}</h2>

                                {/* Layout: Pain Points */}
                                <div className="space-y-4">
                                    <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> The Bottleneck
                                    </div>
                                    <p className="text-sm font-semibold text-slate-500 leading-relaxed">{s.pain}</p>
                                </div>

                                {/* Layout: Feature */}
                                <div className="space-y-4">
                                    <div className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" /> The Solution
                                    </div>
                                    <p className="text-sm font-semibold text-slate-900 leading-relaxed">{s.feature}</p>
                                </div>

                                {/* Layout: Outcome */}
                                <div className="p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex flex-col gap-4">
                                    <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                                        <CheckCircle2 className="h-3 w-3" /> Core Outcome
                                    </div>
                                    <p className="text-lg font-bold text-slate-900 leading-tight">{s.outcome}</p>
                                </div>
                            </div>

                            <div className="pt-6">
                                <Link href="/pricing">
                                    <button className="flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-widest group-hover:gap-4 transition-all duration-300">
                                        Get Started <ArrowRight className="h-4 w-4" />
                                    </button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {/* --- Global Performance --- */}
                <div className="bg-slate-900 rounded-[40px] p-12 md:p-20 text-white relative overflow-hidden mb-40">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/20 blur-[120px] pointer-events-none" />
                    <div className="grid lg:grid-cols-2 gap-20 items-center relative z-10">
                        <div className="space-y-10">
                            <h2 className="text-3xl md:text-5xl font-[650] tracking-tighter leading-tight uppercase">Platform <br /> Stability Index.</h2>
                            <p className="text-slate-400 font-medium text-lg leading-relaxed">
                                Growth requires a stable foundation. Our infrastructure ensures your voice is heard, regardless of volume or network complexity.
                            </p>
                            <div className="flex gap-4">
                                <div className="px-8 py-6 bg-white/5 rounded-2xl border border-white/10 text-center backdrop-blur-sm">
                                    <div className="text-3xl font-bold tracking-tighter text-primary">99.9%</div>
                                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Uptime Rep</div>
                                </div>
                                <div className="px-8 py-6 bg-white/5 rounded-2xl border border-white/10 text-center backdrop-blur-sm">
                                    <div className="text-3xl font-bold tracking-tighter text-primary">400ms</div>
                                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Publish Latency</div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            {[
                                { title: "Enterprise Scalability", desc: "Native support for 100+ accounts per single dashboard." },
                                { title: "Compliance Ready", desc: "Complete DPA/Privacy frameworks for corporate use." },
                                { title: "Authorized API Access", desc: "ZERO brittle web-scrapers or unofficial workarounds." }
                            ].map((feat, i) => (
                                <div key={i} className="flex gap-6 items-start group">
                                    <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 flex-shrink-0"><Zap className="h-5 w-5" /></div>
                                    <div className="space-y-1">
                                        <h4 className="font-bold text-white text-lg uppercase tracking-tight">{feat.title}</h4>
                                        <p className="text-sm font-medium text-slate-400 leading-relaxed">{feat.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- Final Call --- */}
                <div className="text-center space-y-10">
                    <h3 className="text-4xl md:text-6xl font-[650] text-slate-900 tracking-tighter uppercase leading-none">Unified scale starts here.</h3>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Link href="/auth/register">
                            <button className="bg-primary text-white font-bold text-lg px-12 h-16 rounded-full hover:bg-primary/90 transition-all hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5 active:scale-95">
                                Start Free Trial
                            </button>
                        </Link>
                        <Link href="/about">
                            <button className="border-2 border-slate-900 text-slate-900 font-bold text-lg px-12 h-16 rounded-full hover:bg-slate-50 transition-all hover:-translate-y-0.5">
                                Meet Our Team
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
