"use client";

import Link from "next/link";
import {
    Zap,
    Users,
    Globe,
    Cpu,
    Rocket,
    ArrowRight,
    CheckCircle2,
    Heart,
    Briefcase
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function CareersPage() {
    const roles = [
        {
            title: "Protocol Engineer",
            dept: "Engineering",
            location: "Remote / Hybrid",
            tag: "High Velocity"
        },
        {
            title: "Social Growth Lead",
            dept: "Marketing",
            location: "New York, NY",
            tag: "Resonance"
        },
        {
            title: "AI Lab Researcher",
            dept: "Intelligence",
            location: "Remote",
            tag: "2026 AI Lab"
        },
        {
            title: "Security Node Architect",
            dept: "Security",
            location: "London, UK",
            tag: "AES-256"
        }
    ];

    const benefits = [
        { title: "Protocol Ownership", desc: "Equity packages for every engineering and distribution node leader.", icon: <Cpu className="h-6 w-6" /> },
        { title: "Global Mobility", desc: "Work from any resonance point across the globe with our remote-first architecture.", icon: <Globe className="h-6 w-6" /> },
        { title: "Health & Synergy", desc: "Enterprise-grade health and wellness protocols for performance maintenance.", icon: <Heart className="h-6 w-6" /> }
    ];

    return (
        <main className="bg-white min-h-screen font-inter text-[#3E4652]">
            {/* 🚀 Hero Section */}
            <section className="pt-32 pb-24 bg-[#0C1B33] text-white relative overflow-hidden text-center">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-[#3B82F6]/10 blur-[100px] pointer-events-none" />
                <div className="container mx-auto px-6 max-w-[1280px] relative z-10 space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-4">
                        <div className="w-2 h-2 rounded-full bg-[#F9C80E] animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white font-inter">We're Scaling the Team</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold font-plus-jakarta uppercase tracking-tighter leading-none mx-auto max-w-4xl">
                        Build the Future of <br />
                        <span className="text-[#3B82F6]">Social Intelligence.</span>
                    </h1>
                    <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
                        Join the high-velocity team behind SocialHub. We're engineering the next generation of social graphs and distribution protocols.
                    </p>
                    <div className="pt-8">
                        <a href="#open-roles">
                            <button className="bg-[#F9C80E] text-[#0C1B33] font-black text-lg px-12 h-20 rounded-[6px] hover:bg-[#eac00d] transition-all shadow-subtle hover:-translate-y-0.5 font-inter">
                                View Open Protocol
                            </button>
                        </a>
                    </div>
                </div>
            </section>

            {/* 🧩 Culture Section */}
            <section className="py-32">
                <div className="container mx-auto px-6 max-w-[1280px]">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-8">
                            <Badge className="bg-slate-50 text-[#3B82F6] border-[#E1E7EF] uppercase tracking-[0.2em] text-[10px] px-4 py-1.5 font-black font-inter">Our Mandate</Badge>
                            <h2 className="text-4xl md:text-5xl font-extrabold text-[#0C1B33] font-inter tracking-tight uppercase leading-none">
                                Engineering <br /> Resonance.
                            </h2>
                            <p className="text-lg text-slate-500 font-medium leading-relaxed">
                                At SocialHub, we don't just ship code; we architecturalize influence. Our team operates at the intersection of data science, network theory, and high-production social distribution.
                            </p>
                            <div className="grid sm:grid-cols-2 gap-6 pt-4">
                                {["Distributed First", "Node Autonomy", "Radical Transparency", "Continuous Scale"].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-[#3B82F6]" />
                                        <span className="text-sm font-black text-[#0C1B33] uppercase tracking-widest font-inter">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative">
                            <div className="aspect-square bg-slate-50 rounded-[10px] border border-slate-100 flex items-center justify-center p-20 overflow-hidden group">
                                <Zap className="h-48 w-48 text-[#F9C80E] group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#3B82F6]/5 to-transparent" />
                            </div>
                            <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-xl shadow-2xl border border-slate-100 max-w-[240px] space-y-4">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-1.5 h-6 bg-[#3B82F6] rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />)}
                                </div>
                                <p className="text-[10px] font-black text-[#0C1B33] uppercase tracking-widest font-inter">Active Talent Pull: 1,250+</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 📋 Open Roles Grid */}
            <section id="open-roles" className="py-32 bg-slate-50 border-y border-slate-100">
                <div className="container mx-auto px-6 max-w-[1280px]">
                    <div className="text-center mb-24 space-y-4">
                        <h2 className="text-4xl font-extrabold text-[#0C1B33] font-inter uppercase tracking-tight">Open Protocol Positions</h2>
                        <p className="text-lg text-slate-400 font-medium max-w-2xl mx-auto">Select a node to begin the onboarding sequence.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {roles.map((role, i) => (
                            <div key={i} className="bg-white p-8 rounded-[10px] border border-slate-200 hover:border-[#3B82F6] transition-all group flex flex-col md:flex-row justify-between items-center gap-8 shadow-sm hover:shadow-subtle">
                                <div className="space-y-3 text-center md:text-left">
                                    <div className="flex items-center justify-center md:justify-start gap-4">
                                        <h3 className="text-2xl font-extrabold text-[#0C1B33] font-inter uppercase tracking-tight group-hover:text-[#3B82F6] transition-colors">{role.title}</h3>
                                        <Badge className="bg-slate-50 text-[#3B82F6] border-[#E1E7EF] font-black text-[9px] uppercase tracking-widest font-inter">{role.tag}</Badge>
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-inter">{role.dept} • {role.location}</p>
                                </div>
                                <button className="w-full md:w-auto bg-[#0C1B33] text-white font-black text-[10px] uppercase tracking-[0.2em] h-12 px-8 rounded-[6px] hover:bg-[#3B82F6] transition-all font-inter">
                                    Apply Protocol
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 💎 Benefits */}
            <section className="py-32">
                <div className="container mx-auto px-6 max-w-[1280px]">
                    <div className="grid md:grid-cols-3 gap-12">
                        {benefits.map((b, i) => (
                            <div key={i} className="space-y-6 group">
                                <div className="w-16 h-16 rounded-[10px] bg-slate-50 flex items-center justify-center text-[#3B82F6] border border-slate-100 group-hover:bg-[#0C1B33] group-hover:text-[#F9C80E] transition-all">
                                    {b.icon}
                                </div>
                                <h4 className="text-xl font-extrabold text-[#0C1B33] font-inter uppercase tracking-tight leading-none">{b.title}</h4>
                                <p className="text-base text-slate-500 font-medium leading-relaxed">{b.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 🎯 Final CTA */}
            <section className="py-32 container mx-auto px-6 max-w-[1280px]">
                <div className="bg-[#0C1B33] rounded-[10px] p-12 md:p-24 text-center text-white space-y-12 relative overflow-hidden shadow-subtle group">
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-[#3B82F6]/10 blur-[100px] pointer-events-none" />
                    <Briefcase className="h-16 w-16 text-[#F9C80E] mx-auto group-hover:scale-110 transition-transform duration-500" />
                    <h2 className="text-4xl md:text-6xl font-extrabold font-inter tracking-tighter max-w-2xl mx-auto leading-tight uppercase">
                        Don't see your <span className="text-[#3B82F6]">Protocol Node?</span>
                    </h2>
                    <p className="text-xl text-slate-400 font-medium max-w-xl mx-auto">
                        We are always looking for high-velocity talent to join our growth intelligence laboratory.
                    </p>
                    <div className="pt-4">
                        <button className="bg-[#F9C80E] text-[#0C1B33] font-black text-lg px-12 h-20 rounded-[6px] hover:bg-[#eac00d] transition-all shadow-subtle hover:-translate-y-1 font-inter uppercase tracking-widest">
                            General Application
                        </button>
                    </div>
                </div>
            </section>
        </main>
    );
}
