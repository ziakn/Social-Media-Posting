"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Heart, Repeat2, Share2, MoreHorizontal, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { BlueSkyLogo } from "@/components/icons/BlueSkyLogo";

export default function BlueSkyPreview({
    postType,
    content,
    page,
    currentSlide = 0,
    hideLogo = false,
    compact = false,
    noBorder = false
}) {
    const { text, media = [] } = content || {};
    const postMessage = text || ""; // BlueSky uses 'text' mostly, but content object might vary

    // Fallbacks for account info
    const name = page?.username || page?.displayName || "BlueSky User";
    const handle = page?.username || "user.bsky.social";
    const profilePic = page?.profilePicture || page?.avatar;

    const renderMedia = () => {
        const isCarousel = media.length > 1;
        const currentItem = media[currentSlide];

        return (
            <div className={cn(
                "bg-white mx-auto w-full",
                !noBorder && "border-b border-gray-100",
                compact ? "max-w-[320px] p-3" : "max-w-[572px] p-4"
            )}>
                <div className="flex gap-3 relative">
                    {/* Left Column: Avatar */}
                    <div className="flex flex-col items-center shrink-0 w-10">
                        <div className="relative z-10">
                            <Avatar className={cn("border border-gray-50", compact ? "h-8 w-8" : "h-11 w-11")}>
                                <AvatarImage src={profilePic} />
                                <AvatarFallback className={cn("bg-gray-100 uppercase font-black text-gray-400", compact ? "text-[8px]" : "text-[12px]")}>
                                    {name[0] || "B"}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    </div>

                    {/* Right Column: Content */}
                    <div className="flex-1 min-w-0 space-y-1 pb-2">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 min-w-0">
                                <span className={cn("font-bold text-gray-900 truncate", compact ? "text-[13px]" : "text-[15px]")}>
                                    {name}
                                </span>
                                <span className={cn("text-gray-500 truncate", compact ? "text-[12px]" : "text-[14px]")}>
                                    @{handle}
                                </span>
                                <span className="text-gray-400">·</span>
                                <span className={cn("text-gray-400", compact ? "text-[12px]" : "text-[14px]")}>1m</span>
                            </div>
                        </div>

                        {/* Text Content */}
                        {postMessage && (
                            <div className={cn("text-gray-900 leading-normal whitespace-pre-wrap font-normal", compact ? "text-[13px]" : "text-[15px]")}>
                                {postMessage}
                            </div>
                        )}

                        {/* Media Container */}
                        <div className="relative group pt-1.5">
                            {currentItem ? (
                                <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 relative shadow-sm aspect-auto max-h-[400px]">
                                    {currentItem.type?.startsWith('video') ? (
                                        <video
                                            src={currentItem.url}
                                            className="w-full h-full object-cover max-h-[400px]"
                                            autoPlay
                                            muted
                                            loop
                                            playsInline
                                        />
                                    ) : (
                                        <img src={currentItem.url} className="w-full h-full object-contain max-h-[400px] bg-black" alt="" />
                                    )}
                                    {isCarousel && (
                                        <div className="absolute top-3 right-3 bg-black/70 text-white text-[10px] px-2.5 py-1 rounded-full backdrop-blur-md font-bold tracking-wider">
                                            {currentSlide + 1}/{media.length}
                                        </div>
                                    )}
                                </div>
                            ) : !postMessage && (
                                <div className="aspect-square rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 opacity-60">
                                    <BlueSkyLogo className="h-6 w-6 text-slate-300" />
                                    <div className="text-center">
                                        <span className="text-[11px] font-black uppercase text-slate-400 tracking-[0.05em] block">Preview</span>
                                        <span className="text-[9px] text-slate-300 font-bold uppercase tracking-widest mt-1">Waiting for content</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Interactive Actions */}
                        <div className="flex items-center justify-between py-2 text-slate-500 max-w-[300px]">
                            <div className="flex items-center gap-1 group cursor-pointer">
                                <div className="p-1.5 rounded-full group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                    <MessageCircle className="h-4.5 w-4.5" />
                                </div>
                                <span className="text-xs">0</span>
                            </div>
                            <div className="flex items-center gap-1 group cursor-pointer">
                                <div className="p-1.5 rounded-full group-hover:bg-green-50 group-hover:text-green-500 transition-colors">
                                    <Repeat2 className="h-4.5 w-4.5" />
                                </div>
                                <span className="text-xs">0</span>
                            </div>
                            <div className="flex items-center gap-1 group cursor-pointer">
                                <div className="p-1.5 rounded-full group-hover:bg-pink-50 group-hover:text-pink-500 transition-colors">
                                    <Heart className="h-4.5 w-4.5" />
                                </div>
                                <span className="text-xs">0</span>
                            </div>
                            <div className="flex items-center group cursor-pointer">
                                <div className="p-1.5 rounded-full group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                    <MoreHorizontal className="h-4.5 w-4.5" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={cn(
            "bluesky-preview-container animate-in fade-in slide-in-from-bottom-4 duration-700",
            !compact && "w-full"
        )}>
            <div className="flex flex-col items-center gap-6">
                {!hideLogo && (
                    <div className="w-12 h-12 bg-[#0085ff] rounded-xl shadow-xl flex items-center justify-center transform hover:rotate-6 transition-transform cursor-pointer group">
                        <BlueSkyLogo className="h-7 w-7 text-white group-hover:scale-110 transition-transform" />
                    </div>
                )}
                {renderMedia()}
            </div>
        </div>
    );
}
