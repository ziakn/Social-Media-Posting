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
    title: "Social Media Solutions for Agencies, Creators, and Businesses | SocialHub",
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
        <div className="bg-white pt-32 pb-24 font-plus-jakarta text-[#3E4652]">
            <div className="container mx-auto px-6 max-w-[1280px]">
                {/* --- Header --- */}
                <div className="max-w-4xl mx-auto text-center mb-32 space-y-6">
                    <Badge className="bg-slate-50 text-[#3B82F6] border-[#E1E7EF] uppercase tracking-[0.2em] text-[10px] px-4 py-1.5 font-black">Segment Solutions</Badge>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-[#0C1B33] tracking-tighter leading-none font-plus-jakarta uppercase">
                        Tailored Solutions for <span className="text-[#3B82F6]">Every</span> Social Media User
                    </h1>
                    <p className="text-xl text-[#3E4652] font-medium leading-relaxed max-w-2xl mx-auto">
                        SocialHub solves specific operational bottlenecks for high-growth teams. We move beyond "features" to deliver measurable business outcomes.
                    </p>
                </div>

                {/* --- Solution Cards (Pain -> Feature -> Outcome) --- */}
                <div className="grid lg:grid-cols-2 gap-10 mb-40">
                    {solutions.map((s, i) => (
                        <div key={i} className="bg-white border border-[#E1E7EF] rounded-[10px] p-10 flex flex-col space-y-10 hover:shadow-subtle hover:-translate-y-1 transition-all duration-300 relative group shadow-sm">
                            <div className="flex justify-between items-start">
                                <div className="w-14 h-14 bg-[#0C1B33] rounded-lg flex items-center justify-center text-[#F9C80E] group-hover:scale-110 transition-transform">
                                    {s.icon}
                                </div>
                                <Badge className="bg-slate-50 text-slate-400 font-black text-[9px] px-3 py-1 uppercase tracking-widest">{s.badge}</Badge>
                            </div>

                            <div className="space-y-8">
                                <h2 className="text-2xl font-extrabold text-[#0C1B33] font-plus-jakarta uppercase tracking-tight leading-none">{s.title}</h2>

                                {/* Layout: Pain Points */}
                                <div className="space-y-4">
                                    <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> The Bottleneck
                                    </div>
                                    <p className="text-sm font-bold text-slate-500 leading-relaxed font-plus-jakarta">{s.pain}</p>
                                </div>

                                {/* Layout: Feature */}
                                <div className="space-y-4">
                                    <div className="text-[10px] font-black text-[#3B82F6] uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" /> The Solution
                                    </div>
                                    <p className="text-sm font-bold text-[#0C1B33] leading-relaxed">{s.feature}</p>
                                </div>

                                {/* Layout: Outcome */}
                                <div className="p-6 bg-[#28C76F]/5 rounded-lg border border-[#28C76F]/10 space-y-4">
                                    <div className="text-[10px] font-black text-[#28C76F] uppercase tracking-widest flex items-center gap-2">
                                        <CheckCircle2 className="h-3 w-3" /> Core Outcome
                                    </div>
                                    <p className="text-base font-extrabold text-[#0C1B33] leading-tight font-plus-jakarta">{s.outcome}</p>
                                </div>
                            </div>

                            <div className="pt-6">
                                <Link href="/pricing">
                                    <button className="flex items-center gap-2 text-sm font-black text-[#0C1B33] uppercase tracking-widest border-b-2 border-transparent hover:border-[#F9C80E] transition-all">
                                        Get Started <ArrowRight className="h-4 w-4" />
                                    </button>
                                </Link>
                                <span className="sr-only">Agency-focused multi-platform social media management dashboard showcasing solutions for {s.title}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* --- Global Performance --- */}
                <div className="bg-[#0C1B33] rounded-[10px] p-12 md:p-20 text-white relative overflow-hidden mb-40">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-10">
                            <h2 className="text-3xl md:text-5xl font-extrabold font-plus-jakarta tracking-tighter leading-tight uppercase">Platform <br /> Stability Index.</h2>
                            <p className="text-slate-400 font-medium text-lg leading-relaxed">
                                Growth requires a stable foundation. Our infrastructure ensures your voice is heard, regardless of volume or network complexity.
                            </p>
                            <div className="flex gap-4">
                                <div className="px-6 py-4 bg-white/5 rounded-lg border border-white/10 text-center">
                                    <div className="text-2xl font-black font-plus-jakarta tracking-tighter text-[#F9C80E]">99.9%</div>
                                    <div className="text-[9px] font-black text-slate-500 uppercase">Uptime Rep</div>
                                </div>
                                <div className="px-6 py-4 bg-white/5 rounded-lg border border-white/10 text-center">
                                    <div className="text-2xl font-black font-plus-jakarta tracking-tighter text-[#F9C80E]">400ms</div>
                                    <div className="text-[9px] font-black text-slate-500 uppercase">Publish Latency</div>
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
                                    <div className="w-10 h-10 bg-[#0C1B33] border border-white/10 rounded-lg flex items-center justify-center text-[#3B82F6] group-hover:bg-[#3B82F6] group-hover:text-white transition-colors flex-shrink-0"><Zap className="h-5 w-5" /></div>
                                    <div className="space-y-1">
                                        <h4 className="font-extrabold text-white font-plus-jakarta text-lg uppercase tracking-tight">{feat.title}</h4>
                                        <p className="text-sm font-medium text-slate-400 leading-relaxed">{feat.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- Final Call --- */}
                <div className="text-center space-y-10">
                    <h3 className="text-4xl md:text-6xl font-extrabold text-[#0C1B33] font-plus-jakarta tracking-tighter uppercase">Unified scale starts here.</h3>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Link href="/auth/register">
                            <button className="bg-[#F9C80E] text-[#0C1B33] font-black text-lg px-12 h-16 rounded-[6px] hover:bg-[#eac00d] transition-all hover:shadow-subtle hover:-translate-y-0.5 active:scale-95">
                                Start Free Trial
                            </button>
                        </Link>
                        <Link href="/about">
                            <button className="border-2 border-[#0C1B33] text-[#0C1B33] font-bold text-lg px-12 h-16 rounded-[6px] hover:bg-slate-50 transition-all hover:shadow-subtle hover:-translate-y-0.5 font-plus-jakarta">
                                Meet Our Team
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
