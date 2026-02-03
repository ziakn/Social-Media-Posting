"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Heart, Repeat2, Send, Share2, MoreHorizontal, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThreadsLogo } from "@/components/icons/ThreadsLogo";

export default function ThreadsPreview({
    postType,
    content,
    page,
    currentSlide = 0,
    hideLogo = false,
    compact = false,
    noBorder = false
}) {
    const { message, caption, media = [] } = content;
    const postMessage = message || caption || "";
    const name = page?.pageName || page?.displayName || "Threads User";
    const profilePic = page?.profilePicture || page?.picture?.data?.url;

    const renderMedia = () => {
        const isCarousel = media.length > 1;
        const currentItem = media[currentSlide];

        return (
            <div className={cn(
                "bg-white mx-auto w-full",
                !noBorder && "border-b border-gray-100",
                compact ? "max-w-[320px] p-3" : "max-w-[572px] p-6"
            )}>
                <div className="flex gap-3 relative">
                    {/* Left Column: Avatar & Thread Line */}
                    <div className="flex flex-col items-center shrink-0 w-10">
                        <div className="relative z-10">
                            <Avatar className={cn("border border-gray-50", compact ? "h-8 w-8" : "h-11 w-11")}>
                                <AvatarImage src={profilePic} />
                                <AvatarFallback className={cn("bg-gray-100 uppercase font-black text-gray-400", compact ? "text-[8px]" : "text-[12px]")}>
                                    {name[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                                <div className="bg-black rounded-full p-0.5">
                                    <Plus className="h-2 w-2 text-white stroke-[4]" />
                                </div>
                            </div>
                        </div>

                        {/* Vertical Thread Line */}
                        <div className="flex-1 w-[2px] bg-gray-100 my-2 rounded-full" />

                        {/* Multiple Avatar Indicator (Bottom of line) */}
                        <div className="flex -space-x-1.5 mt-1 pb-2">
                            {[1, 2].map(i => (
                                <div key={i} className="w-4 h-4 rounded-full border border-white bg-gray-200" />
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Content */}
                    <div className="flex-1 min-w-0 space-y-2 pb-2">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <span className={cn("font-bold text-gray-900", compact ? "text-[13px]" : "text-[15px]")}>
                                    {name.toLowerCase().replace(/\s/g, '')}
                                </span>
                                <Check className="h-3 w-3 bg-blue-500 text-white rounded-full p-0.5" />
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={cn("text-gray-400", compact ? "text-[12px]" : "text-[14px]")}>1m</span>
                                <MoreHorizontal className="h-5 w-5 text-gray-400 hover:text-black cursor-pointer transition-colors" />
                            </div>
                        </div>

                        {/* Text Content */}
                        {postMessage && (
                            <div className={cn("text-gray-900 leading-normal whitespace-pre-wrap font-medium", compact ? "text-[13px]" : "text-[15px]")}>
                                {postMessage}
                            </div>
                        )}

                        {/* Media Container */}
                        <div className="relative group pt-1">
                            {currentItem ? (
                                <div className="rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 relative aspect-square shadow-sm">
                                    {currentItem.type?.startsWith('video') ? (
                                        <video
                                            src={currentItem.url}
                                            className="w-full h-full object-cover"
                                            autoPlay
                                            muted
                                            loop
                                            playsInline
                                        />
                                    ) : (
                                        <img src={currentItem.url} className="w-full h-full object-cover" alt="" />
                                    )}
                                    {isCarousel && (
                                        <div className="absolute top-3 right-3 bg-black/70 text-white text-[10px] px-2.5 py-1 rounded-full backdrop-blur-md font-bold tracking-wider">
                                            {currentSlide + 1}/{media.length}
                                        </div>
                                    )}
                                </div>
                            ) : !postMessage && (
                                <div className="aspect-square rounded-2xl bg-zinc-50 border-2 border-dashed border-zinc-100 flex flex-col items-center justify-center gap-3 opacity-60">
                                    <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                                        <ThreadsLogo className="h-6 w-6 text-zinc-300" />
                                    </div>
                                    <div className="text-center">
                                        <span className="text-[11px] font-black uppercase text-zinc-400 tracking-[0.2em] block">Threads Preview</span>
                                        <span className="text-[9px] text-zinc-300 font-bold uppercase tracking-widest mt-1">Waiting for content</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Interactive Actions */}
                        <div className="flex items-center gap-5 py-2 text-gray-900">
                            <Heart className="h-5 w-5 stroke-[2] cursor-pointer hover:text-red-500 transition-all active:scale-90" />
                            <MessageCircle className="h-5 w-5 stroke-[2] cursor-pointer hover:text-blue-500 transition-all active:scale-90" />
                            <Repeat2 className="h-5 w-5 stroke-[2] cursor-pointer hover:text-green-500 transition-all active:scale-90" />
                            <Send className="h-5 w-5 stroke-[2] cursor-pointer hover:text-gray-600 transition-all active:scale-90" />
                        </div>

                        {/* Engagement Stats */}
                        <div className="flex items-center gap-2 text-gray-400 text-[14px]">
                            <span className="hover:underline cursor-pointer">0 replies</span>
                            <span>·</span>
                            <span className="hover:underline cursor-pointer">0 likes</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={cn(
            "threads-preview-container animate-in fade-in slide-in-from-bottom-4 duration-700",
            !compact && "w-full"
        )}>
            <div className="flex flex-col items-center gap-6">
                {!hideLogo && (
                    <div className="w-12 h-12 bg-black rounded-2xl shadow-xl flex items-center justify-center transform hover:rotate-6 transition-transform cursor-pointer group">
                        <ThreadsLogo className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
                    </div>
                )}
                {renderMedia()}
            </div>
        </div>
    );
}
