"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, Heart, MessageCircle, Send, Bookmark, Play, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export default function InstagramPreview({
    postType,
    content,
    account,
    currentSlide = 0
}) {
    const { caption, media = [], audio, coverImage } = content;
    const username = account?.username || account?.displayName || "instagram_user";
    const profilePic = account?.pageProfilePicture;

    const renderMedia = () => {
        if (postType === "reels") {
            const video = media.find(m => m.type === 'video');
            return (
                <div className="aspect-[9/16] bg-black relative flex items-center justify-center overflow-hidden">
                    {video ? (
                        <video src={video.url} className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-gray-500 flex flex-col items-center gap-2">
                            <Play className="h-12 w-12" />
                            <span className="text-xs">Reel Preview</span>
                        </div>
                    )}
                    <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-2 text-white drop-shadow-lg">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8 border border-white/20">
                                <AvatarImage src={profilePic} />
                                <AvatarFallback>{username[0]}</AvatarFallback>
                            </Avatar>
                            <span className="font-bold text-sm">@{username}</span>
                        </div>
                        <p className="text-xs line-clamp-2">{caption || "Write a caption..."}</p>
                    </div>
                </div>
            );
        }

        if (postType === "story") {
            const item = media[0];
            return (
                <div className="aspect-[9/16] bg-gradient-to-tr from-yellow-100 via-pink-400 to-purple-600 relative overflow-hidden flex items-center justify-center">
                    {item ? (
                        item.type === 'video' ? (
                            <video src={item.url} className="w-full h-full object-cover" />
                        ) : (
                            <img src={item.url} className="w-full h-full object-cover" alt="" />
                        )
                    ) : (
                        <div className="text-white flex flex-col items-center gap-2 opacity-60">
                            <Play className="h-12 w-12" />
                            <span className="text-xs">Story Preview</span>
                        </div>
                    )}
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                        <div className="p-[2px] bg-gradient-to-tr from-yellow-400 to-fuchsia-600 rounded-full">
                            <Avatar className="h-8 w-8 border border-white">
                                <AvatarImage src={profilePic} />
                                <AvatarFallback>{username[0]}</AvatarFallback>
                            </Avatar>
                        </div>
                        <span className="text-white font-bold text-xs shadow-black drop-shadow-md">@{username}</span>
                    </div>
                </div>
            );
        }

        // Feed / Carousel logic
        const isCarousel = media.length > 1;
        const currentItem = media[currentSlide];

        return (
            <div className="flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={profilePic} />
                            <AvatarFallback>{username[0]}</AvatarFallback>
                        </Avatar>
                        <span className="font-bold text-sm">@{username}</span>
                    </div>
                    <MoreHorizontal className="h-5 w-5 text-gray-500" />
                </div>

                <div className="aspect-square bg-gray-50 relative flex items-center justify-center overflow-hidden">
                    {currentItem ? (
                        <>
                            {currentItem.type === 'video' ? (
                                <video src={currentItem.url} className="w-full h-full object-cover" />
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
                                            <div key={i} className={cn("w-1.5 h-1.5 rounded-full", i === currentSlide ? "bg-blue-500" : "bg-gray-300")} />
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="text-gray-300 flex flex-col items-center gap-2">
                            <Layers className="h-10 w-10" />
                            <span className="text-xs italic">No media selected</span>
                        </div>
                    )}
                </div>

                <div className="p-3">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-4">
                            <Heart className="h-6 w-6" />
                            <MessageCircle className="h-6 w-6" />
                            <Send className="h-6 w-6" />
                        </div>
                        <div className="flex items-center gap-1">
                            {isCarousel && (
                                <div className="flex gap-1 mr-2">
                                    {media.map((_, i) => (
                                        <div key={i} className={cn("w-1 h-1 rounded-full", i === currentSlide ? "bg-blue-500" : "bg-gray-200")} />
                                    ))}
                                </div>
                            )}
                            <Bookmark className="h-6 w-6" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm">
                            <span className="font-bold mr-2">@{username}</span>
                            <span className="whitespace-pre-wrap">{caption || "Write a caption..."}</span>
                        </p>
                        <p className="text-[10px] text-gray-400 uppercase mt-2">Just now</p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="instagram-preview-container max-w-[340px] mx-auto sticky top-8">
            {renderMedia()}
        </div>
    );
}
