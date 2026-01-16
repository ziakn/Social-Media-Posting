"use client";

import { MessageSquare, Bell, Filter, CheckCircle } from "lucide-react";

export default function UnifiedInboxSection() {
    return (
        <section className="py-32 bg-slate-50 border-y border-slate-100 overflow-hidden font-inter">
            <div className="container mx-auto px-6 max-w-[1280px]">
                <div className="grid lg:grid-cols-2 gap-24 items-center">
                    <div className="relative group">
                        <div className="bg-white rounded-[12px] border border-slate-200 shadow-2xl overflow-hidden relative">
                            <div className="bg-slate-50 border-b border-slate-200 p-6 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#0C1B33] rounded-lg flex items-center justify-center text-white">
                                        <MessageSquare className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-extrabold text-[#0C1B33] text-sm font-plus-jakarta uppercase tracking-tight">Unified Inbox</h4>
                                        <span className="text-[10px] font-bold text-[#3B82F6] uppercase tracking-widest font-plus-jakarta">3 Unread Mentions</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Filter className="h-5 w-5 text-slate-300" />
                                    <Bell className="h-5 w-5 text-[#F9C80E]" />
                                </div>
                            </div>

                            <div className="p-0">
                                {[
                                    { user: "@alex_j", platform: "TikTok", text: "Love the resonance on this post! 🔥", time: "2m ago" },
                                    { user: "Sarah Designs", platform: "Pinterest", text: "Added to my board. Great quality.", time: "14m ago" },
                                    { user: "Mod Agency", platform: "Instagram", text: "Can we collaborate on the next node?", time: "1h ago" }
                                ].map((msg, i) => (
                                    <div key={i} className="p-6 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors flex justify-between items-start group/msg">
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 shrink-0" />
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-black text-xs text-[#0C1B33] uppercase">{msg.user}</span>
                                                    <span className="text-[9px] font-black px-2 py-0.5 bg-slate-100 text-slate-500 rounded uppercase tracking-widest">{msg.platform}</span>
                                                </div>
                                                <p className="text-xs text-slate-500 font-medium leading-relaxed">{msg.text}</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 font-plus-jakarta">{msg.time}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-[#0C1B33] p-4 text-center">
                                <span className="text-[10px] font-black text-[#F9C80E] uppercase tracking-widest font-plus-jakarta cursor-pointer hover:underline">Launch Enterprise Inbox</span>
                            </div>
                        </div>

                        {/* Decal */}
                        <div className="absolute -bottom-10 -right-10 bg-[#3B82F6] p-6 rounded-xl shadow-xl text-white space-y-2 animate-bounce hidden md:block">
                            <CheckCircle className="h-6 w-6 mx-auto" />
                            <span className="text-xs font-black uppercase tracking-widest block font-plus-jakarta">All Synced</span>
                        </div>
                    </div>

                    <div className="space-y-10">
                        <h2 className="text-4xl md:text-5xl font-extrabold text-[#0C1B33] font-plus-jakarta tracking-tight leading-tight uppercase">
                            Unified Inbox for <br /> <span className="text-[#3B82F6]">Social Resonance</span>
                        </h2>
                        <p className="text-xl text-[#3E4652] font-medium leading-relaxed font-inter">
                            Manage all platform mentions and comments in one centralized command center. Never miss a signal.
                        </p>
                        <ul className="space-y-6">
                            {[
                                "Centralized multi-platform engagement hub",
                                "AI-powered sentiment flagging for mentions",
                                "Rapid-reply protocol for active creator nodes",
                                "Internal team tagging for high-priority signals"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-4 text-sm font-bold text-[#3E4652] group font-inter">
                                    <div className="w-2 h-2 rounded-full bg-[#3B82F6] group-hover:scale-150 transition-transform" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <button className="text-[#3B82F6] font-black text-xs uppercase tracking-widest font-plus-jakarta flex items-center gap-3 hover:translate-x-2 transition-transform pt-4">
                            Explore Engagement Hub
                            <div className="w-8 h-px bg-[#3B82F6]" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
