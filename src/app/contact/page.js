"use client";

import Link from "next/link";
import {
    Mail,
    MessageSquare,
    MapPin,
    Clock,
    ArrowRight,
    Github,
    Twitter,
    Linkedin,
    Send,
    HelpCircle,
    LifeBuoy,
    Zap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ContactPage() {
    return (
        <div className="bg-white pt-32 pb-24 font-plus-jakarta text-[#3E4652]">
            <div className="container mx-auto px-6 max-w-[1200px]">

                {/* --- Header --- */}
                <div className="max-w-4xl mx-auto text-center mb-20 space-y-6">
                    <Badge className="bg-slate-50 text-[#3B82F6] border-[#E1E7EF] uppercase tracking-[0.2em] text-[10px] px-4 py-1.5 font-black">Authorized Support</Badge>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-[#0C1B33] tracking-tighter leading-none font-plus-jakarta uppercase">
                        Let's <span className="text-[#3B82F6]">Connect.</span>
                    </h1>
                    <p className="text-xl text-[#3E4652] font-medium leading-relaxed max-w-2xl mx-auto">
                        Whether you're looking for an enterprise-level DPA or technical API support, our engineering and sales teams are standing by.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-20 items-start">

                    {/* --- Contact Form (Option A Style) --- */}
                    <div className="bg-white border border-[#E1E7EF] p-10 md:p-12 rounded-[10px] space-y-10 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-1/4 h-full bg-[#3B82F6]/5 blur-[100px] pointer-events-none" />
                        <div className="space-y-3 relative z-10 border-l-4 border-[#F9C80E] pl-6">
                            <h3 className="text-2xl font-extrabold text-[#0C1B33] font-plus-jakarta uppercase tracking-tight">Post an inquiry</h3>
                            <p className="text-[10px] font-black text-[#0C1B33] uppercase tracking-widest opacity-40 font-plus-jakarta">Typical response latency: 42m</p>
                        </div>

                        <form className="space-y-6 relative z-10" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                    <input placeholder="John Doe" className="w-full h-14 rounded-[8px] border border-[#E1E7EF] bg-[#F5F8FB] px-6 font-bold text-[#0C1B33] focus:bg-white focus:ring-1 focus:ring-[#3B82F6] outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Email</label>
                                    <input type="email" placeholder="john@company.com" className="w-full h-14 rounded-[8px] border border-[#E1E7EF] bg-[#F5F8FB] px-6 font-bold text-[#0C1B33] focus:bg-white focus:ring-1 focus:ring-[#3B82F6] outline-none" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                                <input placeholder="Inquiry about Enterprise API Access" className="w-full h-14 rounded-[8px] border border-[#E1E7EF] bg-[#F5F8FB] px-6 font-bold text-[#0C1B33] focus:bg-white focus:ring-1 focus:ring-[#3B82F6] outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Message</label>
                                <textarea placeholder="Outline your requirements..." className="w-full min-h-[160px] rounded-[8px] border border-[#E1E7EF] bg-[#F5F8FB] p-6 font-bold text-[#0C1B33] focus:bg-white focus:ring-1 focus:ring-[#3B82F6] outline-none resize-none" />
                            </div>
                            <button className="w-full h-16 rounded-[8px] bg-[#0C1B33] text-white font-extrabold text-lg uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-navy-500/20 active:scale-95 flex items-center justify-center gap-3">
                                Send Message <Send className="h-5 w-5" />
                            </button>
                        </form>
                    </div>

                    {/* --- Information & Support Units --- */}
                    <div className="space-y-12 py-6">

                        {/* Specialized Units */}
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="p-8 bg-white border border-[#E1E7EF] rounded-[10px] space-y-4 hover:border-[#3B82F6] transition-all group">
                                <div className="w-12 h-12 bg-[#F5F8FB] rounded-lg flex items-center justify-center text-[#0C1B33] group-hover:bg-[#0C1B33] group-hover:text-[#F9C80E] transition-colors">
                                    <HelpCircle className="h-6 w-6" />
                                </div>
                                <h4 className="font-extrabold text-[#0C1B33] font-plus-jakarta uppercase">Help Resources</h4>
                                <p className="text-xs text-slate-500 font-bold leading-relaxed px-1">Access 100+ technical guides on platform optimization.</p>
                                <Link href="#" className="inline-flex items-center gap-2 text-[#3B82F6] font-black text-[10px] uppercase tracking-widest pt-4 group-hover:translate-x-1 transition-transform">
                                    Search Guides <ArrowRight className="h-3 w-3" />
                                </Link>
                            </div>
                            <div className="p-8 bg-white border border-[#E1E7EF] rounded-[10px] space-y-4 hover:border-[#3B82F6] transition-all group">
                                <div className="w-12 h-12 bg-[#F5F8FB] rounded-lg flex items-center justify-center text-[#0C1B33] group-hover:bg-[#0C1B33] group-hover:text-[#F9C80E] transition-colors">
                                    <LifeBuoy className="h-6 w-6" />
                                </div>
                                <h4 className="font-extrabold text-[#0C1B33] font-plus-jakarta uppercase">Dev Support</h4>
                                <p className="text-xs text-slate-500 font-bold leading-relaxed px-1">Rapid-response debugging for enterprise API users.</p>
                                <Link href="#" className="inline-flex items-center gap-2 text-[#3B82F6] font-black text-[10px] uppercase tracking-widest pt-4 group-hover:translate-x-1 transition-transform">
                                    Open Ticket <ArrowRight className="h-3 w-3" />
                                </Link>
                            </div>
                        </div>

                        {/* High-Authority Location Block */}
                        <div className="p-10 bg-[#0C1B33] rounded-[10px] text-white space-y-10 relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-1/2 h-full bg-[#F9C80E]/5 blur-[100px] pointer-events-none" />
                            <div className="space-y-8">
                                <div className="flex gap-6 items-start">
                                    <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-[#F9C80E] border border-white/10 flex-shrink-0"><MapPin className="h-5 w-5" /></div>
                                    <div className="space-y-1">
                                        <h5 className="font-black text-[#5e6a7c] uppercase tracking-widest text-[9px]">SF Engineering Hub</h5>
                                        <p className="font-bold text-slate-200">123 Media Ave, Suite 400<br />San Francisco, CA 94103</p>
                                    </div>
                                </div>
                                <div className="flex gap-6 items-start">
                                    <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-[#3B82F6] border border-white/10 flex-shrink-0"><Mail className="h-5 w-5" /></div>
                                    <div className="space-y-1">
                                        <h5 className="font-black text-[#5e6a7c] uppercase tracking-widest text-[9px]">Global Correspondence</h5>
                                        <p className="font-bold text-slate-200">hello@socialhub.com</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6 border-t border-white/5">
                                {[
                                    { icon: <Twitter className="h-4 w-4" />, href: "#" },
                                    { icon: <Linkedin className="h-4 w-4" />, href: "#" }
                                ].map((item, i) => (
                                    <Link key={i} href={item.href} className="w-10 h-10 rounded-lg border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                                        {item.icon}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Status Indicator */}
                        <div className="flex items-center gap-3 justify-center text-[10px] font-black uppercase text-slate-300 tracking-[0.2em]">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            All Systems Operable • Response Active
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
