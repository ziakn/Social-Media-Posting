"use client";

import Link from "next/link";
import {
    Download,
    FileText,
    Image as ImageIcon,
    Mail,
    Globe,
    ExternalLink,
    Camera,
    Palette,
    ArrowRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function PressPage() {
    const assets = [
        {
            title: "Primary Logos",
            desc: "SVG and PNG formats for all backgrounds.",
            icon: <Palette className="h-6 w-6 text-[#3B82F6]" />,
            type: "Pack",
            size: "4.2 MB"
        },
        {
            title: "Brand Guidelines",
            desc: "Typography, color palette, and usage rules.",
            icon: <FileText className="h-6 w-6 text-[#F9C80E]" />,
            type: "PDF",
            size: "12.8 MB"
        },
        {
            title: "Product Screenshots",
            desc: "High-resolution UI captures of the platform.",
            icon: <ImageIcon className="h-6 w-6 text-[#0C1B33]" />,
            type: "Gallery",
            size: "28.5 MB"
        },
        {
            title: "Executive Photos",
            desc: "Professional headshots of our leadership team.",
            icon: <Camera className="h-6 w-6 text-[#3B82F6]" />,
            type: "Pack",
            size: "15.1 MB"
        }
    ];

    const stats = [
        { label: "Active Users", value: "12,000+" },
        { label: "Platforms Supported", value: "7" },
        { label: "Founded", value: "2024" },
        { label: "Headquarters", value: "San Francisco" }
    ];

    return (
        <main className="bg-white min-h-screen font-inter text-[#3E4652]">
            {/* 🚀 Hero Section */}
            <section className="pt-32 pb-24 bg-[#0C1B33] text-white relative overflow-hidden text-center">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-[#3B82F6]/10 blur-[100px] pointer-events-none" />
                <div className="container mx-auto px-6 max-w-[1280px] relative z-10 space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-4">
                        <div className="w-2 h-2 rounded-full bg-[#F9C80E] animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white font-inter">Official Press Kit</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold font-plus-jakarta uppercase tracking-tighter leading-none mx-auto max-w-4xl">
                        Your Story, <br />
                        <span className="text-[#3B82F6]">Powered by SocialHub.</span>
                    </h1>
                    <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
                        Access official resources, brand assets, and company information to help you tell the SocialHub story.
                    </p>
                </div>
            </section>

            {/* 🏛️ Company Narrative */}
            <section className="py-32">
                <div className="container mx-auto px-6 max-w-[1280px]">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-8">
                            <Badge className="bg-slate-50 text-[#3B82F6] border-[#E1E7EF] uppercase tracking-[0.2em] text-[10px] px-4 py-1.5 font-black font-inter">Our Narrative</Badge>
                            <h2 className="text-4xl md:text-5xl font-extrabold text-[#0C1B33] font-inter tracking-tight uppercase leading-none">
                                Simplifying the <br /> Digital World.
                            </h2>
                            <p className="text-lg text-slate-500 font-medium leading-relaxed">
                                SocialHub is the leading platform for multi-channel social media management. We empower creators and brands to reclaim their time by unifying content scheduling, discovery, and analytics into one seamless experience.
                            </p>
                            <p className="text-lg text-slate-500 font-medium leading-relaxed">
                                Built for the next generation of social engagement, our platform simplifies complex workflows and provides the clear insights needed to grow a meaningful online presence.
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-4">
                                {stats.map((stat, i) => (
                                    <div key={i} className="space-y-1">
                                        <div className="text-3xl font-black text-[#0C1B33] font-plus-jakarta tracking-tight">{stat.value}</div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-inter">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative">
                            <div className="aspect-[4/3] bg-slate-50 rounded-[10px] border border-slate-100 flex items-center justify-center p-20 overflow-hidden group">
                                <Globe className="h-48 w-48 text-[#3B82F6] group-hover:scale-110 transition-transform duration-700 opacity-20" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center space-y-4">
                                        <Button variant="outline" className="h-14 px-8 border-[#3B82F6] text-[#3B82F6] hover:bg-[#3B82F6] hover:text-white font-black uppercase tracking-widest text-[10px]">
                                            Read Our Story <ExternalLink className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#3B82F6]/5 to-transparent" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 🎨 Brand Assets Grid */}
            <section className="py-32 bg-slate-50 border-y border-slate-100">
                <div className="container mx-auto px-6 max-w-[1280px]">
                    <div className="text-center mb-24 space-y-4">
                        <h2 className="text-4xl font-extrabold text-[#0C1B33] font-inter uppercase tracking-tight">Media Assets</h2>
                        <p className="text-lg text-slate-400 font-medium max-w-2xl mx-auto">High-resolution assets for print and digital media.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {assets.map((asset, i) => (
                            <div key={i} className="bg-white p-8 rounded-[10px] border border-slate-200 hover:border-[#3B82F6] transition-all group flex items-center justify-between shadow-sm hover:shadow-subtle">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-[10px] bg-slate-50 flex items-center justify-center text-[#3B82F6] border border-slate-100 group-hover:bg-[#0C1B33] group-hover:text-[#F9C80E] transition-all flex-shrink-0">
                                        {asset.icon}
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-extrabold text-[#0C1B33] font-inter uppercase tracking-tight">{asset.title}</h3>
                                        <p className="text-sm text-slate-500 font-medium">{asset.desc}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <button className="bg-[#0C1B33] text-white p-3 rounded-[6px] hover:bg-[#3B82F6] transition-all">
                                        <Download className="h-5 w-5" />
                                    </button>
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{asset.type} • {asset.size}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-16 text-center">
                        <Button className="h-16 px-12 bg-white border border-slate-200 text-[#0C1B33] hover:bg-slate-50 font-black uppercase tracking-widest text-xs shadow-sm shadow-slate-200/50">
                            Download Complete Kit (.ZIP) <Download className="ml-2 h-4 w-4 text-[#3B82F6]" />
                        </Button>
                    </div>
                </div>
            </section>

            {/* 🎯 Media Contact Section */}
            <section className="py-32 container mx-auto px-6 max-w-[1280px]">
                <div className="bg-[#0C1B33] rounded-[10px] p-12 md:p-24 text-center text-white space-y-12 relative overflow-hidden shadow-subtle group">
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-[#3B82F6]/10 blur-[100px] pointer-events-none" />
                    <Mail className="h-16 w-16 text-[#F9C80E] mx-auto group-hover:scale-110 transition-transform duration-500" />
                    <h2 className="text-4xl md:text-6xl font-extrabold font-inter tracking-tighter max-w-2xl mx-auto leading-tight uppercase">
                        For <span className="text-[#3B82F6]">Media Inquiries</span>
                    </h2>
                    <p className="text-xl text-slate-400 font-medium max-w-xl mx-auto">
                        Looking for an interview, specific quote, or platform demo? Our communication team is here to assist you.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
                        <div className="space-y-1">
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-inter">Press Email</div>
                            <div className="text-2xl font-black text-[#F9C80E] font-plus-jakarta tracking-tight">press@socialhub.ai</div>
                        </div>
                        <div className="w-px h-12 bg-white/10 hidden sm:block" />
                        <Link href="/contact">
                            <button className="bg-[#3B82F6] text-white font-black text-sm px-12 h-16 rounded-[6px] hover:bg-[#2563EB] transition-all shadow-subtle hover:-translate-y-1 font-inter uppercase tracking-widest flex items-center gap-2">
                                Send Inquiry <ArrowRight className="h-4 w-4 text-[#F9C80E]" />
                            </button>
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
