"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { CheckCircle2, Clock, Facebook, Instagram, Twitter, Send, Zap, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CalendarPreviewSection() {
    const [isPublishing, setIsPublishing] = useState(false);
    const [isPublished, setIsPublished] = useState(false);

    const handlePublish = () => {
        setIsPublishing(true);
        setTimeout(() => {
            setIsPublishing(false);
            setIsPublished(true);
        }, 1500);
    };

    return (
        <section className="py-32 bg-white overflow-hidden font-inter">
            <div className="container mx-auto px-6 max-w-[1280px]">
                <div className="flex flex-col lg:flex-row items-center gap-20">
                    <div className="flex-1 space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3B82F6]/5 border border-[#3B82F6]/10">
                            <Zap className="h-4 w-4 text-[#3B82F6]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#0C1B33] font-plus-jakarta">Visual Scheduling Protocol</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-[#0C1B33] font-plus-jakarta tracking-tight leading-tight uppercase">
                            Your Entire Social <br /> <span className="text-[#3B82F6]">Network on One Grid</span>
                        </h2>
                        <p className="text-xl text-[#3E4652] font-medium leading-relaxed max-w-[500px]">
                            Drag, drop, and distribute. Our Unified Calendar gives you a bird's-eye view of your content ecosystem across every node.
                        </p>
                        <ul className="space-y-4">
                            {[
                                "Multi-platform post stacking",
                                "One-click 'Publish Now' from cell",
                                "Visual draft orchestration",
                                "Peak resonance time-slot indicators"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-600 font-bold">
                                    <div className="w-5 h-5 rounded-full bg-[#27C93F]/10 flex items-center justify-center text-[#27C93F]">
                                        <CheckCircle2 className="h-3 w-3" />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex-1 relative w-full">
                        <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#3B82F6]/5 blur-[100px] pointer-events-none" />

                            {/* Mock Calendar Grid */}
                            <div className="grid grid-cols-3 gap-4 relative z-10">
                                {/* Cell 1 - Empty */}
                                <div className="bg-white/60 border border-slate-100 rounded-2xl p-4 h-48 flex flex-col transition-all hover:shadow-md">
                                    <span className="text-slate-300 font-black text-sm mb-4">12</span>
                                    <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-100 rounded-xl group/btn hover:border-[#3B82F6]/20 transition-colors cursor-pointer">
                                        <Plus className="h-5 w-5 text-slate-200 group-hover/btn:text-[#3B82F6] transition-colors" />
                                    </div>
                                </div>

                                {/* Cell 2 - Active Cell with Post */}
                                <div className="bg-white border-2 border-[#3B82F6]/20 rounded-2xl p-4 h-56 flex flex-col shadow-xl z-20 scale-105 -translate-y-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="inline-flex items-center justify-center w-8 h-8 bg-[#3B82F6] text-white rounded-full font-black text-xs shadow-lg shadow-[#3B82F6]/20">13</span>
                                        <div className="flex -space-x-2">
                                            <div className="w-6 h-6 rounded-full bg-[#0C1B33] border-2 border-white flex items-center justify-center text-[#F9C80E]">
                                                <Zap className="h-3 w-3" />
                                            </div>
                                            <div className="w-6 h-6 rounded-full bg-[#0C1B33] border-2 border-white flex items-center justify-center text-white">
                                                <Instagram className="h-3 w-3" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-3 relative overflow-hidden group/post">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-md bg-white border border-slate-200 overflow-hidden">
                                                <div className="w-full h-full bg-gradient-to-br from-[#3B82F6] to-blue-600 opacity-20" />
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <div className="h-1.5 w-full bg-slate-200 rounded-full" />
                                                <div className="h-1.5 w-2/3 bg-slate-200 rounded-full" />
                                            </div>
                                        </div>

                                        <button
                                            onClick={handlePublish}
                                            disabled={isPublishing || isPublished}
                                            className={cn(
                                                "w-full py-2 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2",
                                                isPublished
                                                    ? "bg-[#27C93F] text-white shadow-[#27C93F]/20 cursor-default"
                                                    : "bg-[#0C1B33] text-white hover:bg-slate-800 shadow-slate-200"
                                            )}
                                        >
                                            {isPublishing ? (
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                            ) : isPublished ? (
                                                <><CheckCircle2 className="h-3 w-3" /> Published</>
                                            ) : (
                                                <><Send className="h-3 w-3" /> Publish Now</>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Cell 3 - Previous Post */}
                                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 h-48 flex flex-col opacity-60">
                                    <span className="text-slate-300 font-black text-sm mb-4">14</span>
                                    <div className="bg-white rounded-xl p-3 border border-slate-100 flex items-center gap-3">
                                        <CheckCircle2 className="h-4 w-4 text-[#27C93F]" />
                                        <div className="h-1.5 w-12 bg-slate-100 rounded-full" />
                                    </div>
                                </div>
                            </div>

                            {/* Branding Labels */}
                            <div className="mt-8 flex justify-between items-center opacity-40">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#0C1B33]">Protocol Active</span>
                                </div>
                                <span className="text-[9px] font-bold text-slate-400 font-plus-jakarta uppercase tracking-widest">Global Node Sync v4.0</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
