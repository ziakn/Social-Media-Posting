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
    currentSlide = 0
}) {
    const { message, caption, media = [] } = content;
    const postMessage = message || caption || "";
    const name = page?.pageName || page?.displayName || "Threads User";
    const profilePic = page?.profilePicture || page?.picture?.data?.url;

    const renderMedia = () => {
        const isCarousel = media.length > 1;
        const currentItem = media[currentSlide];

        return (
            <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] max-w-[400px] w-full mx-auto">
                <div className="p-4 flex flex-col gap-3">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border border-gray-50">
                                <AvatarImage src={profilePic} />
                                <AvatarFallback className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400">
                                    {name[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="text-[14px] font-bold text-gray-900 leading-tight">
                                    {name.toLowerCase().replace(/\s/g, '')}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[13px] text-gray-400 font-medium">1m</span>
                            <MoreHorizontal className="h-4 w-4 text-gray-400" />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex flex-col gap-3 post-body pl-12 -mt-3">
                        {postMessage && (
                            <div className="text-[14px] text-gray-900 leading-normal whitespace-pre-wrap">
                                {postMessage}
                            </div>
                        )}

                        {/* Media */}
                        {currentItem && (
                            <div className="rounded-xl overflow-hidden border border-gray-50 bg-gray-50 relative aspect-square shadow-sm">
                                {currentItem.type?.startsWith('video') ? (
                                    <video src={currentItem.url} className="w-full h-full object-cover" controls />
                                ) : (
                                    <img src={currentItem.url} className="w-full h-full object-cover" alt="" />
                                )}
                                {isCarousel && (
                                    <div className="absolute top-3 right-3 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm font-bold">
                                        {currentSlide + 1}/{media.length}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-4 py-1 text-gray-900">
                            <Heart className="h-[20px] w-[20px] stroke-[1.5px]" />
                            <MessageCircle className="h-[20px] w-[20px] stroke-[1.5px]" />
                            <Repeat2 className="h-[20px] w-[20px] stroke-[1.5px]" />
                            <Send className="h-[20px] w-[20px] stroke-[1.5px]" />
                        </div>

                        {/* Footer Info */}
                        <div className="flex items-center gap-2 text-[13px] text-gray-400 font-medium">
                            <span>0 replies</span>
                            <span>·</span>
                            <span>0 likes</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="threads-preview-container w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col items-center gap-4">
                <div className="p-3 bg-gray-50 rounded-2xl">
                    <ThreadsLogo className="h-6 w-6 text-black" />
                </div>
                {renderMedia()}
            </div>
        </div>
    );
}
