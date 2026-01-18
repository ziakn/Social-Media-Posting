"use client";

import React from "react";
import PinterestLogo from "@/components/icons/PinterestLogo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pin, Link as LinkIcon, Check, Globe, MoreHorizontal, MessageSquare, Heart, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PinterestPreview({
    content = { message: "", media: [] },
    page,
    currentSlide = 0,
    title = "",
    link = "",
    boardName = ""
}) {
    const { message, media = [] } = content;
    const name = page?.username || "Pinterest User";
    const profilePic = page?.profilePicture;
    const currentMedia = media[currentSlide];
    const isCarousel = media.length > 1;

    return (
        <div className="flex flex-col items-center justify-center p-6 lg:p-12 bg-gray-100/30 rounded-[3rem] border border-dashed border-gray-200 h-full min-h-[600px] font-sans">
            {/* Context Label */}
            <div className="mb-10 flex flex-col items-center gap-3">
                <div className="flex items-center gap-2.5 px-3 py-1 bg-white rounded-full border border-gray-100 shadow-sm">
                    <PinterestLogo className="h-3 w-3" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Pinterest Preview</span>
                    <div className="w-1 h-1 rounded-full bg-red-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#E60023]">Live</span>
                </div>
            </div>

            {/* Pin Card (Premium Design) */}
            <div className="w-full max-w-[360px] bg-white rounded-[2.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.12)] overflow-hidden transition-all duration-700 hover:shadow-[0_50px_100px_rgba(0,0,0,0.15)] group relative">

                {/* Board Context Header (Top) */}
                {boardName && (
                    <div className="absolute top-4 left-4 z-20">
                        <div className="px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/20 flex items-center gap-2">
                            <Pin className="h-2.5 w-2.5 text-white" />
                            <span className="text-[9px] font-black text-white uppercase tracking-widest leading-none">{boardName}</span>
                        </div>
                    </div>
                )}

                {/* Media Container */}
                <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden">
                    {currentMedia ? (
                        <div className="w-full h-full relative">
                            {currentMedia.type === 'video' ? (
                                <video
                                    src={currentMedia.url}
                                    className="w-full h-full object-cover"
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                />
                            ) : (
                                <img
                                    src={currentMedia.url}
                                    alt=""
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                            )}

                            {isCarousel && (
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-[#E60023] text-[10px] px-3 py-1.5 rounded-full font-black tracking-widest shadow-lg border border-[#E60023]/10">
                                    {currentSlide + 1} <span className="opacity-30 mx-0.5">/</span> {media.length}
                                </div>
                            )}

                            {/* Carousel Indicators (Bottom of Media) */}
                            {isCarousel && (
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 px-3 py-2 bg-black/20 backdrop-blur-md rounded-full border border-white/10">
                                    {media.map((_, i) => (
                                        <div key={i} className={cn("w-1.5 h-1.5 rounded-full transition-all duration-300", i === currentSlide ? "bg-white w-4" : "bg-white/40")} />
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-6 bg-zinc-50/50">
                            <div className="relative">
                                <div className="absolute inset-0 bg-[#E60023] blur-2xl opacity-10 animate-pulse rounded-full" />
                                <div className="relative h-20 w-20 rounded-[2rem] bg-white shadow-xl flex items-center justify-center transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-700">
                                    <PinterestLogo className="h-10 w-10 text-gray-100" />
                                </div>
                            </div>
                            <div className="text-center space-y-1">
                                <span className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em] block">Visual Engine</span>
                                <span className="text-[9px] text-zinc-200 font-bold uppercase tracking-widest">Waiting for creative asset</span>
                            </div>
                        </div>
                    )}

                    {/* Pinterest Save Button (Hover Only) */}
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-end p-5">
                        <div className="flex items-center gap-2">
                            <div className="h-10 w-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer">
                                <Share2 className="h-4 w-4 text-gray-600" />
                            </div>
                            <div className="px-6 py-2.5 bg-[#E60023] text-white text-[13px] font-black rounded-full shadow-xl hover:bg-[#ad001a] hover:scale-105 transition-all">
                                Save
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Container */}
                <div className="p-7 space-y-6">
                    <div className="space-y-2.5">
                        <h3 className={cn(
                            "text-2xl font-black text-gray-900 leading-tight tracking-tight break-words",
                            !title && "text-gray-200"
                        )}>
                            {title || "Impactful Title Goes Here"}
                        </h3>
                        {message && (
                            <p className="text-[14px] font-medium text-gray-500 line-clamp-3 leading-relaxed break-words">
                                {message}
                            </p>
                        )}

                        {link && (
                            <div className="flex items-center gap-1.5 text-blue-600 font-bold text-xs mt-3">
                                <Globe className="h-3 w-3" />
                                <span className="underline underline-offset-4 decoration-2">{new URL(link).hostname}</span>
                            </div>
                        )}
                    </div>

                    <div className="pt-6 flex items-center justify-between border-t border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Avatar className="h-10 w-10 border-2 border-white shadow-md ring-1 ring-gray-100 transition-transform group-hover:scale-105 duration-500">
                                    <AvatarImage src={profilePic} />
                                    <AvatarFallback className="bg-gray-50 font-black text-gray-400 text-[10px] uppercase">
                                        {name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-1 -right-1 bg-[#007AFF] rounded-full p-1 border-2 border-white shadow-sm">
                                    <Check className="h-2 w-2 text-white stroke-[3.5]" />
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[14px] font-black text-gray-900 leading-none">{name}</span>
                                <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">Business Academy</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-9 w-9 rounded-full bg-gray-50 flex items-center justify-center hover:bg-red-50 transition-colors cursor-pointer group/icon">
                                <MoreHorizontal className="h-4 w-4 text-gray-400 group-hover/icon:text-[#E60023]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Verification Footer */}
            <div className="mt-10 flex flex-col items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-1000">
                <div className="flex items-center gap-2 py-1 px-3 bg-white/50 border border-gray-100 rounded-full">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Platform Synchronized Architecture</span>
                </div>
                <p className="text-[9px] font-bold text-gray-300 uppercase tracking-[0.2em]">Studio v2.0 • Pinterest Core Engine</p>
            </div>
        </div>
    );
}
