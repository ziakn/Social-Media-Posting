import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    MoreHorizontal, Heart, MessageCircle, Share2, Play, Layers, Repeat2, BarChart3,
    Edit, Trash2, Send, Eye, Loader2, ImageIcon
} from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { XLogo } from "@/components/icons/XLogo";

export default function XPostCard({
    post,
    onEditClick,
    onPublishNow,
    publishingId
}) {
    const isPublishing = publishingId === post.id;
    const [currentSlide, setCurrentSlide] = useState(0);

    // Data Normalization
    // Data Normalization
    const name = post.name || "X User";
    const handle = post.username ? (post.username.startsWith('@') ? post.username : `@${post.username}`) : "@user";
    const profilePicture = post.profilePicture;
    const postMessage = post.message || post.caption || "";
    const media = post.mediaUrls || (post.mediaUrl ? [{ url: post.mediaUrl, type: post.postType }] : []);
    const isCarousel = media.length > 1;
    const timestamp = post.status === 'scheduled' ? post.scheduledAt : post.createdAt;

    // Status Badge Color
    const getStatusColor = () => {
        switch (post.status) {
            case 'posted': return "bg-green-100 text-green-700 hover:bg-green-100 border-green-200";
            case 'scheduled': return "bg-sky-100 text-sky-700 hover:bg-sky-100 border-sky-200";
            default: return "bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-200";
        }
    };

    return (
        <div className={cn(
            "flex flex-col gap-3 p-5 border border-gray-100 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 relative group h-full",
            isPublishing && "opacity-70 pointer-events-none"
        )}>
            {/* Loading Overlay for Publishing */}
            {isPublishing && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-black" />
                        <span className="text-xs font-bold text-gray-900">Publishing...</span>
                    </div>
                </div>
            )}

            <div className="flex items-start gap-3">
                {/* Left: Avatar */}
                <div className="shrink-0">
                    <Avatar className="h-10 w-10 border border-gray-100">
                        <AvatarImage src={profilePicture} className="object-cover" />
                        <AvatarFallback className="bg-gray-100 text-gray-500 font-bold">{name[0]}</AvatarFallback>
                    </Avatar>
                </div>

                {/* Right: Content Header */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5">
                                <span className="text-[15px] font-bold text-gray-900 truncate">{name}</span>
                                {post.status !== 'posted' && (
                                    <Badge variant="secondary" className={cn("h-4 px-1.5 text-[9px] font-bold uppercase tracking-wider rounded border", getStatusColor())}>
                                        {post.status}
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-1 text-[13px] text-gray-500">
                                <span className="truncate">{handle}</span>
                                <span>·</span>
                                <span className="hover:underline cursor-pointer">
                                    {timestamp ? formatDistanceToNow(new Date(timestamp), { addSuffix: false }).replace('about ', '') : 'Now'}
                                </span>
                            </div>
                        </div>

                        {/* Admin Actions Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50/50 rounded-full">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-gray-100">
                                {post.status === 'posted' ? (
                                    <>
                                        <DropdownMenuItem onClick={() => onEditClick(post)} className="gap-2.5 text-xs font-bold rounded-lg cursor-pointer">
                                            <Eye className="h-4 w-4" /> View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onEditClick(post, 'analytics')} className="gap-2.5 text-xs font-bold text-black rounded-lg cursor-pointer">
                                            <BarChart3 className="h-4 w-4" /> View Analytics
                                        </DropdownMenuItem>
                                    </>
                                ) : (
                                    <>
                                        <DropdownMenuItem onClick={() => onEditClick(post)} className="gap-2.5 text-xs font-bold rounded-lg cursor-pointer">
                                            <Edit className="h-4 w-4" /> Edit Post
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={(e) => onPublishNow(e, post)} className="gap-2.5 text-xs font-bold text-black rounded-lg cursor-pointer">
                                            <Send className="h-4 w-4" /> Publish Now
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onEditClick(post, 'delete')} className="gap-2.5 text-xs font-bold text-red-600 rounded-lg cursor-pointer">
                                            <Trash2 className="h-4 w-4" /> Delete Post
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <div>

                {/* Message */}
                {postMessage && (
                    <div className="text-[15px] text-gray-900 leading-normal whitespace-pre-wrap mb-3">
                        {postMessage}
                    </div>
                )}

                {/* Media */}
                {media.length > 0 && (
                    <div className="rounded-2xl overflow-hidden border border-gray-200 mb-3 bg-gray-50 relative aspect-video group/media cursor-pointer" onClick={() => setCurrentSlide(prev => (prev + 1) % media.length)}>
                        {media[currentSlide]?.type?.startsWith('video') || post.postType === 'video' ? (
                            <div className="w-full h-full bg-black flex items-center justify-center relative">
                                <video src={media[currentSlide]?.url} className="w-full h-full object-contain" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover/media:bg-black/30 transition-colors">
                                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40">
                                        <Play className="h-5 w-5 fill-white text-white ml-0.5" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <img src={media[currentSlide]?.url} className="w-full h-full object-cover" alt="" />
                        )}

                        {/* Carousel Indicator */}
                        {isCarousel && (
                            <div className="absolute bottom-3 right-3 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-md flex items-center gap-1.5">
                                <Layers className="h-3 w-3" />
                                {currentSlide + 1} / {media.length}
                            </div>
                        )}

                        {/* Alt Badge (Fake) */}
                        <div className="absolute bottom-3 left-3 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-md opacity-0 group-hover/media:opacity-100 transition-opacity">
                            ALT
                        </div>
                    </div>
                )}

                {/* Link Preview (if standard text post with link and no media) */}
                {/* Simplified for now, usually handled by backend metadata */}

                {/* Action Bar */}
                <div className="flex items-center justify-between text-gray-500 pt-3 mt-auto border-t border-gray-50">
                    {/* Replies */}
                    <div className="flex items-center gap-1 group/action cursor-pointer hover:text-black transition-colors min-w-[60px]">
                        <div className="p-2 -ml-2 rounded-full group-hover/action:bg-blue-50/50 transition-colors">
                            <MessageCircle className="h-[18px] w-[18px]" />
                        </div>
                        <span className="text-[13px] font-medium">{formatNumber(post.metrics?.replies || 0)}</span>
                    </div>

                    {/* Reposts */}
                    <div className="flex items-center gap-1 group/action cursor-pointer hover:text-green-500 transition-colors min-w-[60px]">
                        <div className="p-2 -ml-2 rounded-full group-hover/action:bg-green-50/50 transition-colors">
                            <Repeat2 className="h-[18px] w-[18px]" />
                        </div>
                        <span className="text-[13px] font-medium">{formatNumber(post.metrics?.retweets || 0)}</span>
                    </div>

                    {/* Likes */}
                    <div className="flex items-center gap-1 group/action cursor-pointer hover:text-pink-600 transition-colors min-w-[60px]">
                        <div className="p-2 -ml-2 rounded-full group-hover/action:bg-pink-50/50 transition-colors">
                            <Heart className="h-[18px] w-[18px]" />
                        </div>
                        <span className="text-[13px] font-medium">{formatNumber(post.metrics?.likes || 0)}</span>
                    </div>

                    {/* Views/Chart */}
                    <div className="flex items-center gap-1 group/action cursor-pointer hover:text-black transition-colors min-w-[60px]">
                        <div className="p-2 -ml-2 rounded-full group-hover/action:bg-blue-50/50 transition-colors">
                            <BarChart3 className="h-[18px] w-[18px]" />
                        </div>
                        <span className="text-[13px] font-medium">{formatNumber(post.metrics?.impressions || 0)}</span>
                    </div>

                    {/* Share */}
                    <div className="flex items-center gap-1 group/action cursor-pointer hover:text-black transition-colors">
                        <div className="p-2 -ml-2 rounded-full group-hover/action:bg-blue-50/50 transition-colors">
                            <Share2 className="h-[18px] w-[18px]" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
