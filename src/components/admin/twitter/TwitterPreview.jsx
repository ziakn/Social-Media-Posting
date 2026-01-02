"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, Heart, MessageCircle, Share2, Play, Layers, Repeat2, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TwitterPreview({
    postType,
    content,
    page,
    currentSlide = 0
}) {
    const { message, caption, media = [], link } = content;
    const postMessage = message || caption || "";
    const name = page?.username || page?.displayName || "X User";
    const handle = "@" + (name.replace(/\s/g, "").toLowerCase());
    const profilePic = page?.profilePicture || page?.picture?.data?.url;

    const renderMedia = () => {
        const isCarousel = media.length > 1;
        const currentItem = media[currentSlide];

        return (
            <div className="flex flex-col bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:bg-gray-50/50 transition-colors cursor-pointer">
                <div className="p-3 flex gap-3">
                    {/* Left: Avatar */}
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={profilePic} />
                        <AvatarFallback>{name[0]}</AvatarFallback>
                    </Avatar>

                    {/* Right: Content */}
                    <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-[15px] leading-5 truncate">
                                <span className="font-bold text-gray-900 truncate">{name}</span>
                                <span className="text-gray-500 truncate">{handle}</span>
                                <span className="text-gray-500">·</span>
                                <span className="text-gray-500 hover:underline">1m</span>
                            </div>
                            <MoreHorizontal className="h-4 w-4 text-gray-500" />
                        </div>

                        {/* Message */}
                        {postMessage && (
                            <div className="text-[15px] text-gray-900 whitespace-pre-wrap leading-normal mt-0.5 mb-2">
                                {postMessage}
                            </div>
                        )}

                        {/* Media Content */}
                        {(currentItem || (postType === 'link' && link)) && (
                            <div className="rounded-2xl overflow-hidden border border-gray-200 mt-2 relative">
                                {currentItem ? (
                                    <div className="aspect-video bg-black/5 relative flex items-center justify-center overflow-hidden">
                                        {currentItem.type?.startsWith('video') ? (
                                            <div className="w-full h-full bg-black flex items-center justify-center">
                                                <video src={currentItem.url} className="w-full h-full object-contain" />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                                    <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white">
                                                        <Play className="h-5 w-5 fill-white" />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <img src={currentItem.url} className="w-full h-full object-cover" alt="" />
                                        )}

                                        {isCarousel && (
                                            <div className="absolute bottom-3 right-3 bg-black/70 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm flex items-center gap-1">
                                                <Layers className="h-3 w-3" />
                                                {currentSlide + 1}/{media.length}
                                            </div>
                                        )}
                                    </div>
                                ) : postType === 'link' && link ? (
                                    <div className="bg-gray-50 h-full">
                                        <div className="h-32 bg-gray-200 flex items-center justify-center text-gray-400">
                                            <span className="text-xs">Link Preview Image</span>
                                        </div>
                                        <div className="p-3 border-t border-gray-200">
                                            <div className="text-gray-500 text-xs truncate">{new URL(link).hostname}</div>
                                            <div className="text-gray-900 text-sm font-medium truncate mt-0.5">Link Title</div>
                                            <div className="text-gray-500 text-sm truncate">Description of the link content...</div>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between mt-3 max-w-md pr-4">
                            <div className="flex items-center gap-2 group text-gray-500 hover:text-black transition-colors">
                                <div className="p-2 -ml-2 rounded-full group-hover:bg-gray-50 transition-colors">
                                    <MessageCircle className="h-4 w-4" />
                                </div>
                                <span className="text-xs">0</span>
                            </div>
                            <div className="flex items-center gap-2 group text-gray-500 hover:text-green-500 transition-colors">
                                <div className="p-2 -ml-2 rounded-full group-hover:bg-green-50 transition-colors">
                                    <Repeat2 className="h-4 w-4" />
                                </div>
                                <span className="text-xs">0</span>
                            </div>
                            <div className="flex items-center gap-2 group text-gray-500 hover:text-pink-500 transition-colors">
                                <div className="p-2 -ml-2 rounded-full group-hover:bg-pink-50 transition-colors">
                                    <Heart className="h-4 w-4" />
                                </div>
                                <span className="text-xs">0</span>
                            </div>
                            <div className="flex items-center gap-2 group text-gray-500 hover:text-black transition-colors">
                                <div className="p-2 -ml-2 rounded-full group-hover:bg-gray-50 transition-colors">
                                    <BarChart2 className="h-4 w-4" />
                                </div>
                                <span className="text-xs">0</span>
                            </div>
                            <div className="flex items-center gap-2 group text-gray-500 hover:text-black transition-colors">
                                <div className="p-2 -ml-2 rounded-full group-hover:bg-gray-50 transition-colors">
                                    <Share2 className="h-4 w-4" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="twitter-preview-container max-w-[450px] mx-auto sticky top-8 animate-in fade-in zoom-in-95 duration-300">
            {renderMedia()}
        </div>
    );
}
