import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Heart, MessageCircle, Play, Layers, Repeat2, BarChart3,
    Edit, Trash2, Send, Eye, Loader2, ImageIcon, MoreVertical
} from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";
import { ThreadsLogo } from "@/components/icons/ThreadsLogo";

export default function XThreadCard({
    post,
    onAction, // (post, action) => {}
    publishingId
}) {
    const isPublishing = publishingId === post.id;
    const media = post.mediaUrls || (post.mediaUrl ? [{ url: post.mediaUrl, type: post.mediaType || post.postType }] : []);
    const message = post.message || post.content?.text || post.caption || "";

    const getStatusBadge = (status) => {
        switch (status) {
            case 'published': return <Badge className="bg-green-500/80 text-white border-0 text-[8px] font-black uppercase">Published</Badge>;
            case 'scheduled': return <Badge className="bg-blue-500/80 text-white border-0 text-[8px] font-black uppercase">Scheduled</Badge>;
            case 'failed': return <Badge className="bg-red-500/80 text-white border-0 text-[8px] font-black uppercase">Failed</Badge>;
            default: return null;
        }
    };

    return (
        <Card className="group relative aspect-square overflow-hidden rounded-2xl border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-gray-900">
            {/* Media Content */}
            <div className="absolute inset-0 z-0">
                {media.length > 0 ? (
                    media[0].type?.startsWith('video') || post.mediaType === 'VIDEO' ? (
                        <div className="w-full h-full relative">
                            <video src={media[0].url} className="w-full h-full object-cover" muted />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                <Play className="h-10 w-10 text-white fill-white/20 backdrop-blur-sm rounded-full p-2.5 border border-white/30" />
                            </div>
                        </div>
                    ) : (
                        <img src={media[0].url} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    )
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 p-6 text-center">
                        <ThreadsLogo className="h-10 w-10 text-gray-700 mb-3" />
                        <p className="text-[11px] font-bold text-gray-500 line-clamp-3 leading-relaxed">{message || "No preview available"}</p>
                    </div>
                )}
            </div>

            {/* Overlays */}
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-between p-4">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1.5 translate-y-[-10px] group-hover:translate-y-0 transition-transform duration-300">
                        {getStatusBadge(post.status)}
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-black/40 border border-white/20 text-white backdrop-blur-md hover:bg-black/60 translate-y-[-10px] group-hover:translate-y-0 transition-transform duration-300">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 rounded-2xl border-none shadow-2xl p-1.5 focus:ring-0">
                            {post.status === 'published' ? (
                                <>
                                    <DropdownMenuItem onClick={() => onAction?.(post, 'analytics')} className="rounded-xl font-bold py-2 gap-2 text-blue-600 px-3">
                                        <BarChart3 className="h-4 w-4" /> Performance
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onAction?.(post, 'view')} className="rounded-xl font-bold py-2 gap-2 px-3">
                                        <Eye className="h-4 w-4" /> View Thread
                                    </DropdownMenuItem>
                                </>
                            ) : (
                                <>
                                    <DropdownMenuItem onClick={() => onAction?.(post, 'edit')} className="rounded-xl font-bold py-2 gap-2 px-3">
                                        <Edit className="h-4 w-4" /> Edit Content
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onAction?.(post, 'publish_now')} className="rounded-xl font-bold py-2 gap-2 text-purple-600 px-3">
                                        <Send className="h-4 w-4" /> Publish Now
                                    </DropdownMenuItem>
                                </>
                            )}
                            <div className="h-px bg-gray-100 my-1" />
                            <DropdownMenuItem onClick={() => onAction?.(post, 'delete')} className="rounded-xl font-bold py-2 gap-2 text-red-600 px-3">
                                <Trash2 className="h-4 w-4" /> Delete Post
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="space-y-3 translate-y-[20px] group-hover:translate-y-0 transition-transform duration-300">
                    <div className="flex items-center gap-4 text-white">
                        <div className="flex items-center gap-1.5">
                            <Heart className="h-4 w-4 fill-white" />
                            <span className="text-sm font-black tracking-tight">{formatNumber(post.metrics?.likes || 0)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <MessageCircle className="h-4 w-4 fill-white text-white" />
                            <span className="text-sm font-black tracking-tight">{formatNumber(post.metrics?.replies || 0)}</span>
                        </div>
                    </div>
                    <p className="text-[11px] font-bold text-gray-200 line-clamp-2 leading-relaxed">
                        {message}
                    </p>
                </div>
            </div>

            {/* Carousel Indicator */}
            {media.length > 1 && (
                <div className="absolute top-4 left-4 z-20">
                    <div className="bg-black/40 backdrop-blur-md border border-white/20 p-1.5 rounded-lg">
                        <Layers className="h-3 w-3 text-white" />
                    </div>
                </div>
            )}

            {/* Publishing Indicator */}
            {isPublishing && (
                <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">Sending Thread...</span>
                </div>
            )}

            {/* Platform Badge (Small) */}
            <div className="absolute top-4 right-4 z-0 group-hover:opacity-0 transition-opacity p-1.5 bg-black/40 backdrop-blur-md rounded-lg border border-white/10">
                <ThreadsLogo className="h-3 w-3 text-white" />
            </div>
        </Card>
    );
}

// Sub-component wrapper for Card if needed (import Card from ui/card)
function Card({ children, className }) {
    return (
        <div className={cn("bg-white text-gray-950 shadow-sm", className)}>
            {children}
        </div>
    );
}
