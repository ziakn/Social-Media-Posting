"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, ThumbsUp, MessageCircle, Share2, Play, Layers, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FacebookPreview({
    postType,
    content,
    page,
    currentSlide = 0
}) {
    const { message, caption, media = [], link } = content;
    const postMessage = message || caption || "";
    const name = page?.pageName || page?.displayName || "Facebook Page";
    const profilePic = page?.profilePicture || page?.picture?.data?.url;

    const renderMedia = () => {
        const isCarousel = media.length > 1;
        const currentItem = media[currentSlide];

        return (
            <div className="flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                {/* Header */}
                <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={profilePic} />
                            <AvatarFallback>{name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-bold text-sm hover:underline cursor-pointer">{name}</div>
                            <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                <span>Just now</span>
                                <span>•</span>
                                <Globe className="h-3 w-3" />
                            </div>
                        </div>
                    </div>
                    <MoreHorizontal className="h-5 w-5 text-gray-500 cursor-pointer" />
                </div>

                {/* Message */}
                {postMessage && (
                    <div className="px-3 pb-3 text-sm whitespace-pre-wrap leading-relaxed">
                        {postMessage}
                    </div>
                )}

                {/* Media Content */}
                <div className="aspect-video bg-gray-100 relative flex items-center justify-center overflow-hidden border-y border-gray-100">
                    {currentItem ? (
                        <>
                            {currentItem.type?.startsWith('video') ? (
                                <div className="w-full h-full bg-black flex items-center justify-center">
                                    <video src={currentItem.url} className="w-full h-full object-contain" />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                                            <Play className="h-6 w-6 text-white fill-white" />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <img src={currentItem.url} className="w-full h-full object-cover" alt="" />
                            )}

                            {isCarousel && (
                                <>
                                    <div className="absolute top-3 right-3 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm">
                                        {currentSlide + 1}/{media.length}
                                    </div>
                                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1">
                                        {media.map((_, i) => (
                                            <div key={i} className={cn("w-1.5 h-1.5 rounded-full transition-all", i === currentSlide ? "bg-facebook-blue scale-125" : "bg-gray-300")} />
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="text-gray-300 flex flex-col items-center gap-2">
                            {postType === 'link' ? <Layers className="h-10 w-10 rotate-12" /> : <Layers className="h-10 w-10" />}
                            <span className="text-xs italic font-medium">Post Preview</span>
                        </div>
                    )}
                </div>

                {/* Link Preview (if applicable and no media) */}
                {postType === 'link' && link && !currentItem && (
                    <div className="border-t border-gray-100 bg-gray-50 p-3">
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider">{new URL(link).hostname}</div>
                        <div className="font-bold text-sm line-clamp-2 mt-1">Shared Link Title</div>
                        <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">Clickable link preview description goes here...</div>
                    </div>
                )}

                {/* Stats Bar */}
                <div className="mx-3 py-2.5 flex items-center justify-between border-b border-gray-100">
                    <div className="flex items-center -space-x-1">
                        <div className="w-4 h-4 rounded-full bg-facebook-blue flex items-center justify-center border border-white">
                            <ThumbsUp className="h-2.5 w-2.5 text-white fill-white" />
                        </div>
                        <span className="pl-3 text-xs text-gray-500">0</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>0 comments</span>
                        <span>•</span>
                        <span>0 shares</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="px-1 py-1 flex items-center justify-around">
                    <button className="flex-1 py-1.5 rounded-md hover:bg-gray-100 flex items-center justify-center gap-2 text-gray-600 font-bold text-xs transition-colors">
                        <ThumbsUp className="h-4 w-4" />
                        Like
                    </button>
                    <button className="flex-1 py-1.5 rounded-md hover:bg-gray-100 flex items-center justify-center gap-2 text-gray-600 font-bold text-xs transition-colors">
                        <MessageCircle className="h-4 w-4" />
                        Comment
                    </button>
                    <button className="flex-1 py-1.5 rounded-md hover:bg-gray-100 flex items-center justify-center gap-2 text-gray-600 font-bold text-xs transition-colors">
                        <Share2 className="h-4 w-4" />
                        Share
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="facebook-preview-container max-w-[450px] mx-auto sticky top-8 animate-in fade-in zoom-in-95 duration-300">
            {renderMedia()}
        </div>
    );
}
