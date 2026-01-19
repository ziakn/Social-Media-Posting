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
    boardName = "",
    compact = false
}) {
    const { message, media = [] } = content;
    const name = page?.username || "Pinterest User";
    const profilePic = page?.profilePicture;
    const currentMedia = media[currentSlide];
    const isCarousel = media.length > 1;

    return (
        <div className={cn(
            "flex flex-col items-center justify-center font-sans transition-all duration-500 h-full",
            compact ? "p-0 bg-transparent" : "p-4 sm:p-6"
        )}>

            {/* Pin Card */}
            <div className={cn(
                "w-full bg-white overflow-hidden group relative transition-all duration-500",
                compact ? "rounded-2xl border border-gray-100" : "max-w-[280px] sm:max-w-[360px] rounded-[1.5rem] sm:rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.15)] transition-all duration-700"
            )}>

                {/* Board Context Header (Top) */}
                {boardName && (
                    <div className={cn("absolute z-20", compact ? "top-2 left-2" : "top-4 left-4")}>
                        <div className="px-2 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/20 flex items-center gap-1.5">
                            <Pin className="h-2 w-2 text-white" />
                            <span className="text-[8px] font-black text-white uppercase tracking-widest leading-none">{boardName}</span>
                        </div>
                    </div>
                )}

                {/* Media Container */}
                <div className={cn("relative bg-gray-50 overflow-hidden", compact ? "aspect-square" : "aspect-[3/4]")}>
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
                                <div className={cn(
                                    "absolute bg-white/90 backdrop-blur-md text-[#E60023] text-[10px] rounded-full font-black tracking-widest shadow-lg border border-[#E60023]/10",
                                    compact ? "top-2 right-2 px-2 py-1 text-[8px]" : "top-4 right-4 px-3 py-1.5"
                                )}>
                                    {currentSlide + 1} <span className="opacity-30 mx-0.5">/</span> {media.length}
                                </div>
                            )}

                            {/* Carousel Indicators */}
                            {isCarousel && (
                                <div className={cn(
                                    "absolute left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/20 backdrop-blur-md rounded-full border border-white/10",
                                    compact ? "bottom-2 px-2 py-1.5" : "bottom-4 px-3 py-2"
                                )}>
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
                                <div className={cn(
                                    "relative rounded-[2rem] bg-white shadow-xl flex items-center justify-center transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-700",
                                    compact ? "h-12 w-12 rounded-xl" : "h-20 w-20"
                                )}>
                                    <PinterestLogo className={cn("text-gray-100", compact ? "h-6 w-6" : "h-10 w-10")} />
                                </div>
                            </div>
                            {!compact && (
                                <div className="text-center space-y-1">
                                    <span className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em] block">Visual Engine</span>
                                    <span className="text-[9px] text-zinc-200 font-bold uppercase tracking-widest">Waiting for creative asset</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Pinterest Save Button (Hover Only) */}
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-end p-5">
                        <div className="flex items-center gap-2">
                            {!compact && (
                                <div className="h-10 w-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer">
                                    <Share2 className="h-4 w-4 text-gray-600" />
                                </div>
                            )}
                            <div className={cn(
                                "bg-[#E60023] text-white font-black rounded-full shadow-xl hover:bg-[#ad001a] hover:scale-105 transition-all cursor-pointer",
                                compact ? "px-3 py-1 text-[10px]" : "px-6 py-2.5 text-[13px]"
                            )}>
                                Save
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Container */}
                <div className={cn(compact ? "p-4 space-y-3" : "p-7 space-y-6")}>
                    <div className={cn(compact ? "space-y-1" : "space-y-2.5")}>
                        <h3 className={cn(
                            "font-black text-gray-900 leading-tight tracking-tight break-words",
                            !title && "text-gray-200",
                            compact ? "text-sm line-clamp-2" : "text-2xl"
                        )}>
                            {title || "Impactful Title Goes Here"}
                        </h3>
                        {message && (
                            <p className={cn(
                                "font-medium text-gray-500 leading-relaxed break-words",
                                compact ? "text-xs line-clamp-2" : "text-[14px] line-clamp-3"
                            )}>
                                {message}
                            </p>
                        )}

                        {link && (
                            <div className="flex items-center gap-1.5 text-blue-600 font-bold text-xs mt-3">
                                <Globe className="h-3 w-3" />
                                <span className={cn("underline underline-offset-4 decoration-2 truncate", compact ? "max-w-[150px]" : "max-w-[200px]")}>
                                    {(() => {
                                        try {
                                            return new URL(link).hostname.replace(/^www\./, '');
                                        } catch (e) {
                                            return link;
                                        }
                                    })()}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className={cn("flex items-center justify-between border-t border-gray-100", compact ? "pt-3" : "pt-6")}>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Avatar className={cn("border-2 border-white shadow-md ring-1 ring-gray-100 transition-transform group-hover:scale-105 duration-500", compact ? "h-6 w-6" : "h-10 w-10")}>
                                    <AvatarImage src={profilePic} />
                                    <AvatarFallback className="bg-gray-50 font-black text-gray-400 text-[10px] uppercase">
                                        {name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className={cn("absolute -bottom-1 -right-1 bg-[#007AFF] rounded-full border-2 border-white shadow-sm", compact ? "p-0.5" : "p-1")}>
                                    <Check className={cn("text-white stroke-[3.5]", compact ? "h-1.5 w-1.5" : "h-2 w-2")} />
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className={cn("font-black text-gray-900 leading-none", compact ? "text-xs" : "text-[14px]")}>{name}</span>
                                {!compact && <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">Business Academy</span>}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={cn("rounded-full bg-gray-50 flex items-center justify-center hover:bg-red-50 transition-colors cursor-pointer group/icon", compact ? "h-8 w-8" : "h-9 w-9")}>
                                <MoreHorizontal className="h-4 w-4 text-gray-400 group-hover/icon:text-[#E60023]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
