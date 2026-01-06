"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    MoreVertical, Edit, Trash2, Send, Clock, Calendar, Film, Play, Loader2
} from "lucide-react";
import { getTiktokPosts, deleteTiktokPost } from "@/app/actions/social/tiktok/tiktokPostsActions";
import { publishTiktokPostNow } from "@/app/actions/social/tiktok/tiktokPostsActions";
import { TiktokLogo } from "@/components/icons/TiktokLogo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ScheduledTiktokPosts({ accountId = "all", refreshTrigger = 0, onEdit, onRefresh }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [publishingId, setPublishingId] = useState(null);

    const loadPosts = useCallback(async () => {
        try {
            setLoading(true);
            const result = await getTiktokPosts({
                pageSize: 50,
                filters: {
                    status: "scheduled",
                    accountId: accountId
                }
            });

            if (result.success) {
                setPosts(result.posts);
            } else {
                toast.error(result.message || "Failed to load scheduled posts");
            }
        } catch (err) {
            console.error("Error loading scheduled posts:", err);
        } finally {
            setLoading(false);
        }
    }, [accountId]);

    useEffect(() => {
        loadPosts();
    }, [loadPosts, refreshTrigger]);

    const handlePublishNow = async (e, post) => {
        e.stopPropagation();
        try {
            setPublishingId(post.id);
            // I'll need to implement this server action
            const result = await publishTiktokPostNow(post.id);
            if (result.success) {
                toast.success("Post published successfully!");
                onRefresh?.();
                loadPosts();
            } else {
                toast.error(result.message || "Failed to publish post");
            }
        } catch (error) {
            toast.error("An error occurred while publishing");
        } finally {
            setPublishingId(null);
        }
    };

    const handleDelete = async (e, postId) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this scheduled post?")) return;

        try {
            const result = await deleteTiktokPost(postId);
            if (result.success) {
                toast.success("Scheduled post deleted");
                loadPosts();
                onRefresh?.();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("Failed to delete post");
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-48 w-full rounded-2xl" />
                ))}
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">No scheduled posts</h3>
                    <p className="text-gray-500 mb-6">Your upcoming TikTok videos will appear here.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
                <Card key={post.id} className="group relative border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 bg-white overflow-hidden rounded-2xl">
                    <div className="p-5 flex gap-4">
                        {/* Video Thumbnail */}
                        <div className="relative w-24 h-32 rounded-xl bg-black overflow-hidden shrink-0 border border-gray-100">
                            {post.content?.media?.[0]?.url ? (
                                <video src={post.content.media[0].url} className="w-full h-full object-cover" muted />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <TiktokLogo className="h-8 w-8 text-gray-800" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                <Play className="h-6 w-6 text-white/80 fill-white/20" />
                            </div>
                        </div>

                        {/* Content Info */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Badge variant="secondary" className="bg-purple-50 text-purple-600 border-purple-100 text-[10px] font-black uppercase tracking-wider rounded-md h-5 px-1.5">
                                        Scheduled
                                    </Badge>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-gray-100"><MoreVertical className="h-4 w-4" /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="rounded-xl border border-gray-100 p-1.5">
                                            <DropdownMenuItem onClick={() => onEdit?.(post)} className="flex items-center gap-2 rounded-lg py-2">
                                                <Edit className="h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={(e) => handlePublishNow(e, post)} className="flex items-center gap-2 rounded-lg py-2 text-purple-600">
                                                <Send className="h-4 w-4" /> Publish Now
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={(e) => handleDelete(e, post.id)} className="flex items-center gap-2 rounded-lg py-2 text-red-600 focus:text-red-600">
                                                <Trash2 className="h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight">
                                    {post.content?.text || "No description"}
                                </p>
                            </div>

                            <div className="space-y-1.5 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span className="text-[11px] font-bold">
                                        {post.scheduledAt ? format(new Date(post.scheduledAt), "MMM dd, yyyy") : "N/A"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span className="text-[11px] font-bold">
                                        {post.scheduledAt ? format(new Date(post.scheduledAt), "HH:mm") : "N/A"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {publishingId === post.id && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                            <Loader2 className="h-6 w-6 animate-spin text-black" />
                        </div>
                    )}
                </Card>
            ))}
        </div>
    );
}
