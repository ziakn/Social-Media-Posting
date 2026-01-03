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
import { ThreadsLogo } from "@/components/icons/ThreadsLogo";

export default function XThreadCard({
    post,
    onEditClick,
    onPublishNow,
    publishingId
}) {
    const isPublishing = publishingId === post.id;
    const [currentSlide, setCurrentSlide] = useState(0);

    // Data Normalization
    const name = post.name || "Threads User";
    const username = post.username || "user";
    const profilePicture = post.profilePicture;
    const postMessage = post.content?.text || post.message || post.caption || "";
    const media = post.mediaUrls || (post.mediaUrl ? [{ url: post.mediaUrl, type: post.mediaType || post.postType }] : []);
    const isCarousel = media.length > 1;
    const timestamp = post.status === 'scheduled' ? post.scheduledAt : post.createdAt;

    // Status Badge Color
    const getStatusColor = () => {
        switch (post.status) {
            case 'published':
            case 'posted': return "bg-green-100 text-green-700 hover:bg-green-100 border-green-200";
            case 'scheduled': return "bg-stone-100 text-stone-700 hover:bg-stone-100 border-stone-200";
            default: return "bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-200";
        }
    };

    return (
        <div className={cn(
            "flex flex-col gap-3 p-5 border border-gray-100 bg-white rounded-[24px] shadow-sm hover:shadow-md transition-all duration-300 relative group h-full",
            isPublishing && "opacity-70 pointer-events-none"
        )}>
            {/* Loading Overlay */}
            {isPublishing && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-[1px] rounded-[24px]">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-black" />
                        <span className="text-xs font-bold text-gray-900">Publishing...</span>
                    </div>
                </div>
            )}

            <div className="flex items-start gap-3">
                {/* Left: Avatar with dynamic line */}
                <div className="flex flex-col items-center shrink-0">
                    <Avatar className="h-9 w-9 border border-gray-50">
                        <AvatarImage src={profilePicture} className="object-cover" />
                        <AvatarFallback className="bg-gray-50 font-bold uppercase text-[10px] text-gray-400">{name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="w-[2px] grow mt-2 bg-gray-100 rounded-full min-h-[40px]" />
                </div>

                {/* Right: Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between h-5">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-[14px] font-bold text-gray-900 truncate tracking-tight">{username}</span>
                            {post.status !== 'published' && post.status !== 'posted' && (
                                <Badge variant="secondary" className={cn("h-4 px-1 text-[8px] font-extrabold uppercase tracking-tighter rounded border shrink-0", getStatusColor())}>
                                    {post.status}
                                </Badge>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-[12px] text-gray-400 font-medium whitespace-nowrap">
                                {timestamp ? formatDistanceToNow(new Date(timestamp), { addSuffix: false }).replace('about ', '') : 'Now'}
                            </span>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 -mr-1 text-gray-400 hover:text-black hover:bg-gray-50 rounded-full transition-colors">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40 rounded-[14px] shadow-xl border-gray-100 p-1.5">
                                    {(post.status === 'published' || post.status === 'posted') ? (
                                        <>
                                            <DropdownMenuItem onClick={() => onEditClick(post, 'analytics')} className="gap-2 text-[13px] font-bold text-black rounded-lg">
                                                <BarChart3 className="h-4 w-4" /> Analytics
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onEditClick(post)} className="gap-2 text-[13px] font-bold rounded-lg">
                                                <Eye className="h-4 w-4" /> View Post
                                            </DropdownMenuItem>
                                        </>
                                    ) : (
                                        <>
                                            <DropdownMenuItem onClick={() => onEditClick(post)} className="gap-2 text-[13px] font-bold rounded-lg">
                                                <Edit className="h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={(e) => onPublishNow(e, post)} className="gap-2 text-[13px] font-bold text-black rounded-lg">
                                                <Send className="h-4 w-4" /> Publish Now
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onEditClick(post, 'delete')} className="gap-2 text-[13px] font-bold text-red-600 rounded-lg">
                                                <Trash2 className="h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Message */}
                    <div className="text-[14px] text-gray-900 leading-normal whitespace-pre-wrap mt-1 mb-3 pr-2">
                        {postMessage}
                    </div>

                    {/* Media Container */}
                    {media.length > 0 && (
                        <div className="rounded-[16px] overflow-hidden border border-gray-100 mb-3 bg-gray-50 relative aspect-square cursor-pointer group/media shadow-sm" onClick={() => isCarousel && setCurrentSlide(prev => (prev + 1) % media.length)}>
                            {media[currentSlide]?.type?.startsWith('video') || post.mediaType === 'VIDEO' ? (
                                <div className="w-full h-full bg-black flex items-center justify-center">
                                    <video src={media[currentSlide]?.url} className="w-full h-full object-contain" />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                                            <Play className="h-5 w-5 fill-white text-white ml-0.5" />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <img src={media[currentSlide]?.url} className="w-full h-full object-cover" alt="" />
                            )}

                            {isCarousel && (
                                <div className="absolute top-3 right-3 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md">
                                    {currentSlide + 1} / {media.length}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Interaction Bar */}
                    <div className="flex items-center gap-4 text-gray-900 py-1">
                        <Heart className="h-[20px] w-[20px] stroke-[1.8px] hover:scale-110 transition-transform cursor-pointer" />
                        <MessageCircle className="h-[20px] w-[20px] stroke-[1.8px] hover:scale-110 transition-transform cursor-pointer" />
                        <Repeat2 className="h-[20px] w-[20px] stroke-[1.8px] hover:scale-110 transition-transform cursor-pointer" />
                        <Send className="h-[20px] w-[20px] stroke-[1.8px] hover:scale-110 transition-transform cursor-pointer" />
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-2 text-[13px] text-gray-400 font-medium mt-1">
                        <span>{formatNumber(post.metrics?.replies || 0)} replies</span>
                        <span>·</span>
                        <span>{formatNumber(post.metrics?.likes || 0)} likes</span>
                    </div>
                </div>
            </div>

            {/* Platform indicator */}
            <div className="absolute -top-2 -right-2 p-1.5 bg-black rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <ThreadsLogo className="h-3 w-3 text-white" />
            </div>
        </div>
    );
}
