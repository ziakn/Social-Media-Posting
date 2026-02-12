"use client";

import React, { useState } from "react";
import { CheckCircle2, Zap, Plus, Loader2 } from "lucide-react";
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
        <section className="py-20 overflow-hidden font-sans">
            <div className="container mx-auto px-6 max-w-[1280px]">
                <div className="flex flex-col lg:flex-row items-center gap-20">
                    <div className="flex-1 space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-[50px] bg-[#5e4a7a]/5 border border-[#5e4a7a]/10 backdrop-blur-[4px]">
                            <Zap className="h-4 w-4 text-[#5e4a7a]" />
                            <span className="text-[0.8rem] font-bold uppercase tracking-widest text-[#5e4a7a]">Visual Workspace</span>
                        </div>
                        <h2 className="text-3xl md:text-[2.8rem] font-[650] text-[#2d253b] tracking-[-0.03em] leading-[1.15]">
                            Your Entire Social <br /> <span className="text-[#5e4a7a]">Strategy on One Grid</span>
                        </h2>
                        <p className="text-[1.1rem] text-[#4a3d58] font-[420] leading-relaxed max-w-[500px]">
                            Drag, drop, and organize. Our Unified Calendar gives you a clear overview of your social media content across every platform.
                        </p>
                        <ul className="space-y-4">
                            {[
                                "Manage multiple platforms in one view",
                                "Publish instantly with one click",
                                "Plan and draft your content easily",
                                "Identify the best times to post"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-[#464054] font-[500] text-[1rem]">
                                    <div className="w-6 h-6 rounded-full bg-[#5e4a7a]/10 flex items-center justify-center text-[#5e4a7a]">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex-1 relative w-full">
                        {/* Glassmorphism Calendar Container */}
                        <div className="bg-[rgba(255,255,255,0.4)] backdrop-blur-[12px] rounded-[32px] p-8 border border-[rgba(255,255,255,0.6)] shadow-xl relative overflow-hidden group">

                            {/* Mock Calendar Grid */}
                            <div className="grid grid-cols-3 gap-5 relative z-10">
                                {/* Cell 1 - Empty */}
                                <div className="bg-[rgba(255,255,255,0.5)] border border-[rgba(255,255,255,0.5)] rounded-[20px] p-4 h-48 flex flex-col transition-all hover:bg-[rgba(255,255,255,0.7)]">
                                    <span className="text-[#8a819b] font-bold text-sm mb-4">12</span>
                                    <div className="flex-1 flex items-center justify-center border-2 border-dashed border-[#b8b2c7]/30 rounded-[16px] group/btn hover:border-[#5e4a7a]/30 transition-colors cursor-pointer">
                                        <Plus className="h-6 w-6 text-[#b8b2c7] group-hover/btn:text-[#5e4a7a] transition-colors" />
                                    </div>
                                </div>

                                {/* Cell 2 - Active Cell with Post */}
                                <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-[20px] p-4 h-56 flex flex-col shadow-lg z-20 scale-105 -translate-y-4 ring-1 ring-[#5e4a7a]/5">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="inline-flex items-center justify-center w-8 h-8 bg-[#5e4a7a] text-white rounded-full font-bold text-xs shadow-lg shadow-[#5e4a7a]/20">13</span>
                                        <div className="flex -space-x-2">
                                            <div className="w-7 h-7 rounded-full bg-[#2d253b] border-2 border-white flex items-center justify-center text-[#F9C80E]">
                                                <Zap className="h-3.5 w-3.5" />
                                            </div>
                                            <div className="w-7 h-7 rounded-full bg-[#2d253b] border-2 border-white flex items-center justify-center text-white">
                                                <i className="fab fa-instagram text-[0.8rem]"></i>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 bg-[rgba(240,235,250,0.5)] rounded-[16px] p-3 border border-[rgba(255,255,255,0.8)] space-y-3 relative overflow-hidden">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-[10px] bg-white border border-[#e0dceb] overflow-hidden">
                                                <div className="w-full h-full bg-gradient-to-br from-[#5e4a7a] to-[#8a76a6] opacity-20" />
                                            </div>
                                            <div className="flex-1 space-y-1.5">
                                                <div className="h-2 w-full bg-[#e0dceb] rounded-full" />
                                                <div className="h-2 w-2/3 bg-[#e0dceb] rounded-full" />
                                            </div>
                                        </div>

                                        <button
                                            onClick={handlePublish}
                                            disabled={isPublishing || isPublished}
                                            className={cn(
                                                "w-full py-2.5 rounded-[12px] font-bold text-[10px] uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center justify-center gap-2",
                                                isPublished
                                                    ? "bg-[#27C93F] text-white shadow-[#27C93F]/20 cursor-default"
                                                    : "bg-[#2d253b] text-white hover:bg-[#3e3452] shadow-lg shadow-[#2d253b]/10"
                                            )}
                                        >
                                            {isPublishing ? (
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                            ) : isPublished ? (
                                                <><CheckCircle2 className="h-3.5 w-3.5" /> Published</>
                                            ) : (
                                                <><i className="fas fa-paper-plane text-[0.7rem]"></i> Publish Now</>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Cell 3 - Previous Post */}
                                <div className="bg-[rgba(255,255,255,0.3)] border border-[rgba(255,255,255,0.4)] rounded-[20px] p-4 h-48 flex flex-col opacity-70">
                                    <span className="text-[#8a819b] font-bold text-sm mb-4">14</span>
                                    <div className="bg-white/50 rounded-[16px] p-3 border border-white/60 flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-[#27C93F]" />
                                        <div className="h-2 w-12 bg-[#e0dceb] rounded-full" />
                                    </div>
                                </div>
                            </div>

                            {/* Branding Labels */}
                            <div className="mt-8 flex justify-between items-center opacity-60">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-[#5e4a7a] animate-pulse" />
                                    <span className="text-[0.75rem] font-bold uppercase tracking-widest text-[#4a3d58]">Protocol Active</span>
                                </div>
                                <span className="text-[0.7rem] font-bold text-[#6f5b8b] uppercase tracking-widest">Global Platform Sync v4.0</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
