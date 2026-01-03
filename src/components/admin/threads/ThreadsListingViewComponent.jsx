"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getThreadsPosts } from "@/app/actions/social/threads/threadsPostsActions";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    MoreHorizontal, Heart, MessageCircle, BarChart3,
    Edit, Trash2, Eye, Repeat2, Image as ImageIcon, Video, FileText
} from "lucide-react";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { cn, formatNumber } from "@/lib/utils";
import { toast } from "sonner";

export default function ThreadsListingViewComponent({
    accountId,
    initialStatus = "published",
    refreshTrigger,
    onEdit,
    onRefresh
}) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadPosts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getThreadsPosts({ status: initialStatus, accountId });
            if (res.success) {
                setPosts(res.posts);
            }
        } catch (error) {
            toast.error("Failed to load listing");
        } finally {
            setLoading(false);
        }
    }, [accountId, initialStatus]);

    useEffect(() => {
        loadPosts();
    }, [loadPosts, refreshTrigger]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'published':
            case 'posted': return "bg-green-100 text-green-700 border-green-200";
            case 'scheduled': return "bg-stone-100 text-stone-700 border-stone-200";
            default: return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-[24px] border border-gray-100 p-6">
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[24px] border border-gray-100 overflow-hidden shadow-sm animate-in fade-in duration-500">
            <Table>
                <TableHeader className="bg-gray-50/50">
                    <TableRow className="hover:bg-transparent border-gray-100">
                        <TableHead className="w-[400px] text-[11px] font-black uppercase text-gray-400 tracking-wider h-12 px-6">Content</TableHead>
                        <TableHead className="text-[11px] font-black uppercase text-gray-400 tracking-wider h-12 px-4">Type</TableHead>
                        <TableHead className="text-[11px] font-black uppercase text-gray-400 tracking-wider h-12 px-4">Status</TableHead>
                        <TableHead className="text-[11px] font-black uppercase text-gray-400 tracking-wider h-12 px-4">Date</TableHead>
                        <TableHead className="text-[11px] font-black uppercase text-gray-400 tracking-wider h-12 px-4 text-center">Stats</TableHead>
                        <TableHead className="w-[80px] h-12"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {posts.map((post) => (
                        <TableRow key={post.id} className="group border-gray-50 hover:bg-gray-50/50 transition-colors">
                            <TableCell className="px-6 py-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                                        {(post.mediaUrls?.[0]?.url || post.mediaUrl || post.content?.mediaUrl) ? (
                                            <img
                                                src={post.mediaUrls?.[0]?.url || post.mediaUrl || post.content?.mediaUrl}
                                                className="w-full h-full object-cover"
                                                alt=""
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                                <FileText className="h-5 w-5 text-gray-300" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col min-w-0 pt-1">
                                        <div className="text-[13px] font-bold text-gray-900 truncate leading-tight mb-1 pr-10">
                                            {post.content?.text || post.message || post.caption || "No text content"}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-4 w-4">
                                                <AvatarImage src={post.profilePicture} />
                                                <AvatarFallback className="text-[6px]">{post.username?.[0]}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                                                @{post.username || "user"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="px-4">
                                <div className="flex items-center gap-2">
                                    {post.postType === 'video' || post.mediaType === 'VIDEO' ? (
                                        <Badge variant="outline" className="h-6 bg-purple-50 text-purple-600 border-purple-100 gap-1.5 font-bold text-[10px] px-2 rounded-lg">
                                            <Video className="h-3 w-3" /> VIDEO
                                        </Badge>
                                    ) : (post.mediaUrls?.length > 1 || post.postType === 'carousel') ? (
                                        <Badge variant="outline" className="h-6 bg-blue-50 text-blue-600 border-blue-100 gap-1.5 font-bold text-[10px] px-2 rounded-lg">
                                            <ImageIcon className="h-3 w-3" /> CAROUSEL
                                        </Badge>
                                    ) : (post.mediaUrls?.length === 1 || post.mediaUrl || post.content?.mediaUrl) ? (
                                        <Badge variant="outline" className="h-6 bg-emerald-50 text-emerald-600 border-emerald-100 gap-1.5 font-bold text-[10px] px-2 rounded-lg">
                                            <ImageIcon className="h-3 w-3" /> IMAGE
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="h-6 bg-gray-50 text-gray-500 border-gray-100 gap-1.5 font-bold text-[10px] px-2 rounded-lg">
                                            <FileText className="h-3 w-3" /> TEXT
                                        </Badge>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="px-4">
                                <Badge className={cn("h-6 font-black text-[9px] uppercase tracking-tighter rounded-lg border", getStatusColor(post.status))}>
                                    {post.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="px-4">
                                <div className="flex flex-col">
                                    <span className="text-[12px] font-bold text-gray-900">
                                        {format(new Date(post.scheduledAt || post.createdAt), "MMM dd, yyyy")}
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                                        {format(new Date(post.scheduledAt || post.createdAt), "HH:mm")}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell className="px-4">
                                <div className="flex items-center justify-center gap-4">
                                    <div className="flex flex-col items-center">
                                        <span className="text-[12px] font-black text-gray-900">{formatNumber(post.metrics?.likes || 0)}</span>
                                        <Heart className="h-3 w-3 text-gray-300 group-hover:text-pink-500 transition-colors" />
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-[12px] font-black text-gray-900">{formatNumber(post.metrics?.replies || 0)}</span>
                                        <MessageCircle className="h-3 w-3 text-gray-300 group-hover:text-sky-500 transition-colors" />
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-[12px] font-black text-gray-900">{formatNumber(post.metrics?.reposts || 0)}</span>
                                        <Repeat2 className="h-3 w-3 text-gray-300 group-hover:text-emerald-500 transition-colors" />
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="px-6 text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreHorizontal className="h-4 w-4 text-gray-400" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-40 rounded-xl p-1.5 shadow-xl border-gray-100">
                                        <DropdownMenuItem onClick={() => onEdit(post)} className="gap-2.5 text-[13px] font-bold rounded-lg px-3">
                                            <Edit className="h-4 w-4" /> Edit Post
                                        </DropdownMenuItem>
                                        {(post.status === 'published' || post.status === 'posted') && (
                                            <DropdownMenuItem onClick={() => onEdit(post, 'analytics')} className="gap-2.5 text-[13px] font-bold text-blue-600 rounded-lg px-3">
                                                <BarChart3 className="h-4 w-4" /> Statistics
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem onClick={() => onEdit(post, 'delete')} className="gap-2.5 text-[13px] font-bold text-red-600 rounded-lg px-3">
                                            <Trash2 className="h-4 w-4" /> Delete Post
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
