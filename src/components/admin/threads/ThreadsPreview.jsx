"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Heart, Repeat2, Send, Share2, MoreHorizontal } from "lucide-react";
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
                "bg-white overflow-hidden mx-auto",
                !noBorder && "border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
                compact ? "rounded-xl max-w-[260px]" : "rounded-3xl max-w-[400px] w-full"
            )}>
                <div className={cn("flex flex-col gap-2.5", compact ? "p-2.5" : "p-4")}>
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Avatar className={cn("border border-gray-50", compact ? "h-7 w-7" : "h-9 w-9")}>
                                    <AvatarImage src={profilePic} />
                                    <AvatarFallback className={cn("bg-gray-50 uppercase font-bold text-gray-400", compact ? "text-[8px]" : "text-[10px]")}>
                                        {name[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 border border-gray-50 shadow-sm">
                                    <div className="bg-black rounded-full p-0.5">
                                        <ThreadsLogo className="h-2 w-2 text-white" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className={cn("font-bold text-gray-900 leading-tight", compact ? "text-[12px]" : "text-[14px]")}>
                                    {name.toLowerCase().replace(/\s/g, '')}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={cn("text-gray-400 font-medium", compact ? "text-[11px]" : "text-[13px]")}>1m</span>
                            {!compact && <MoreHorizontal className="h-4 w-4 text-gray-400" />}
                        </div>
                    </div>

                    {/* Content */}
                    <div className={cn("flex flex-col gap-2.5 post-body -mt-3", compact ? "pl-9" : "pl-12")}>
                        {postMessage && (
                            <div className={cn("text-gray-900 leading-normal whitespace-pre-wrap", compact ? "text-[12px]" : "text-[14px]")}>
                                {postMessage}
                            </div>
                        )}



                        {/* Media */}
                        <div className="relative group">
                            {currentItem ? (
                                <div className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50 relative aspect-square shadow-sm">
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
                                        <div className="absolute top-3 right-3 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm font-bold">
                                            {currentSlide + 1}/{media.length}
                                        </div>
                                    )}
                                </div>
                            ) : !postMessage && (
                                <div className="aspect-square rounded-xl bg-gray-50 border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-2 opacity-50">
                                    <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                                        <ThreadsLogo className="h-5 w-5 text-gray-300" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Preview Ready</span>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className={cn("flex items-center gap-4 py-1 text-gray-900", compact && "gap-3")}>
                            <Heart className={cn("stroke-[1.5px] cursor-pointer hover:scale-110 transition-transform", compact ? "h-4 w-4" : "h-[20px] w-[20px]")} />
                            <MessageCircle className={cn("stroke-[1.5px] cursor-pointer hover:scale-110 transition-transform", compact ? "h-4 w-4" : "h-[20px] w-[20px]")} />
                            <Repeat2 className={cn("stroke-[1.5px] cursor-pointer hover:scale-110 transition-transform", compact ? "h-4 w-4" : "h-[20px] w-[20px]")} />
                            <Send className={cn("stroke-[1.5px] cursor-pointer hover:scale-110 transition-transform", compact ? "h-4 w-4" : "h-[20px] w-[20px]")} />
                        </div>

                        {/* Footer Info */}
                        <div className="flex flex-col gap-1">
                            <div className={cn("flex items-center gap-2 text-gray-400 font-medium", compact ? "text-[11px]" : "text-[13px]")}>
                                <span>0 replies</span>
                                <span>·</span>
                                <span>0 likes</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={cn(
            "threads-preview-container animate-in fade-in slide-in-from-bottom-4 duration-500",
            !compact && "w-full sticky top-8"
        )}>
            <div className={cn("flex flex-col items-center gap-4", compact && "gap-0")}>
                {!hideLogo && (
                    <div className="p-3 bg-black rounded-2xl shadow-lg">
                        <ThreadsLogo className="h-6 w-6 text-white" />
                    </div>
                )}
                {renderMedia()}
            </div>
        </div>
    );
}
