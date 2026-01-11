"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, ThumbsUp, Share2, Send, MoreHorizontal, Globe, Repeat2, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { LinkedinLogo } from "@/components/icons/LinkedinLogo";

export default function LinkedinPreview({
    content,
    page,
    currentSlide = 0,
    hideLogo = false,
    compact = false,
    noBorder = false
}) {
    const { message, text, caption, media = [] } = content;
    const postMessage = message || text || caption || "";
    const name = page?.displayName || page?.pageName || "LinkedIn User";
    const profilePic = page?.profilePicture || page?.picture?.data?.url;
    const headline = page?.headline || "Professional at Network";

    const renderMedia = () => {
        const currentItem = media[currentSlide];

        return (
            <div className={cn(
                "bg-white mx-auto w-full font-sans",
                !noBorder && "border border-gray-200 rounded-xl overflow-hidden shadow-sm",
                compact ? "max-w-[320px]" : "max-w-[552px]"
            )}>
                {/* Header */}
                <div className="p-3 flex items-start justify-between">
                    <div className="flex gap-2">
                        <Avatar className={cn("border border-gray-100 shadow-sm", compact ? "h-10 w-10" : "h-12 w-12")}>
                            <AvatarImage src={profilePic} />
                            <AvatarFallback className="bg-blue-50 text-[#0077b5] font-black uppercase text-[10px]">
                                {name[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                                <span className="font-bold text-gray-900 text-[14px] hover:text-[#0077b5] hover:underline cursor-pointer">
                                    {name}
                                </span>
                                <span className="text-gray-400 text-[13px] font-medium">· 1st</span>
                            </div>
                            <span className="text-gray-500 text-[11px] leading-tight line-clamp-1">{headline}</span>
                            <div className="flex items-center gap-1 mt-0.5">
                                <span className="text-gray-400 text-[11px]">1m ·</span>
                                <Globe className="h-3 w-3 text-gray-400" />
                            </div>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 rounded-full hover:bg-gray-100">
                        <MoreHorizontal className="h-5 w-5" />
                    </Button>
                </div>

                {/* Text Content */}
                {postMessage && (
                    <div className={cn("px-3 pb-3 text-gray-900 leading-normal whitespace-pre-wrap text-[14px]", compact ? "line-clamp-3" : "")}>
                        {postMessage}
                    </div>
                )}

                {/* Media Container */}
                <div className="relative group">
                    {currentItem ? (
                        <div className="bg-gray-100 relative aspect-video overflow-hidden">
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
                        </div>
                    ) : !postMessage && (
                        <div className="aspect-video bg-blue-50 flex flex-col items-center justify-center gap-3 opacity-60">
                            <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center shadow-lg transform rotate-3">
                                <LinkedinLogo className="h-6 w-6 text-[#0077b5]" />
                            </div>
                            <div className="text-center">
                                <span className="text-[10px] font-black uppercase text-[#0077b5] tracking-[0.2em] block">Professional Preview</span>
                                <span className="text-[8px] text-blue-300 font-bold uppercase tracking-widest mt-1">Waiting for content</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Engagement Bar */}
                <div className="px-3 py-2 flex items-center justify-between border-b border-gray-100">
                    <div className="flex -space-x-1 items-center">
                        <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center border border-white z-20">
                            <ThumbsUp className="h-2 w-2 text-white fill-white" />
                        </div>
                        <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center border border-white z-10">
                            <Heart className="h-2 w-2 text-white fill-white" />
                        </div>
                        <span className="text-[11px] text-gray-500 ml-2 hover:text-[#0077b5] hover:underline cursor-pointer font-medium">0</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                        <span className="hover:text-[#0077b5] hover:underline cursor-pointer">0 comments</span>
                        <span>·</span>
                        <span className="hover:text-[#0077b5] hover:underline cursor-pointer">0 reposts</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="px-1 py-1 flex items-center gap-1">
                    <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md hover:bg-gray-100 transition-colors text-gray-500 group">
                        <ThumbsUp className="h-5 w-5 group-hover:text-[#0077b5]" />
                        <span className="text-[13px] font-bold group-hover:text-[#0077b5]">Like</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md hover:bg-gray-100 transition-colors text-gray-500 group">
                        <MessageCircle className="h-5 w-5 group-hover:text-[#0077b5]" />
                        <span className="text-[13px] font-bold group-hover:text-[#0077b5]">Comment</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md hover:bg-gray-100 transition-colors text-gray-500 group">
                        <Repeat2 className="h-5 w-5 group-hover:text-[#0077b5]" />
                        <span className="text-[13px] font-bold group-hover:text-[#0077b5]">Repost</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md hover:bg-gray-100 transition-colors text-gray-500 group">
                        <Send className="h-5 w-5 group-hover:text-[#0077b5]" />
                        <span className="text-[13px] font-bold group-hover:text-[#0077b5]">Send</span>
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className={cn(
            "linkedin-preview-container animate-in fade-in slide-in-from-bottom-4 duration-700",
            !compact && "w-full"
        )}>
            <div className="flex flex-col items-center gap-4">
                {!hideLogo && (
                    <div className="w-10 h-10 bg-[#0077b5] rounded-lg shadow-xl flex items-center justify-center transform hover:rotate-6 transition-transform cursor-pointer group">
                        <LinkedinLogo className="h-5 w-5 text-white group-hover:scale-110 transition-transform" />
                    </div>
                )}
                {renderMedia()}
            </div>
        </div>
    );
}

function Button({ children, className, variant, size, ...props }) {
    return (
        <button className={cn(className)} {...props}>
            {children}
        </button>
    );
}
