// src/components/admin/tiktok/TiktokViewComponent.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Search, TrendingUp, Heart, MessageCircle, Eye, X, Filter,
    Layers, Play, Edit, MoreVertical, Send, Trash2, History, Loader2, BarChart3,
    Check, Share2
} from "lucide-react";
import { getTiktokPosts, getTiktokPostsStats, deleteTiktokPost } from "@/app/actions/social/tiktok/tiktokPostsActions";
import { getUserTikTokAccounts } from "@/app/actions/social/tiktok/getAccounts";
import { TiktokLogo } from "@/components/icons/TiktokLogo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function TiktokViewComponent({
    accountId: initialAccountId,
    initialStatus = "all",
    refreshTrigger = 0,
    onEdit = null,
    onRefresh = null
}) {
    const [posts, setPosts] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [accounts, setAccounts] = useState([]);
    const [deletingId, setDeletingId] = useState(null);

    const [filters, setFilters] = useState({
        status: initialStatus,
        accountId: initialAccountId || "all",
        searchQuery: "",
        sortBy: "date",
        sortOrder: "desc"
    });

    const [pagination, setPagination] = useState({
        pageSize: 12,
        hasMore: false,
        lastPostId: null
    });

    useEffect(() => {
        const loadAccounts = async () => {
            const result = await getUserTikTokAccounts();
            if (result.success) setAccounts(result.accounts || []);
        };
        loadAccounts();
    }, []);

    const loadStats = useCallback(async () => {
        try {
            const result = await getTiktokPostsStats({ accountId: filters.accountId });
            if (result.success) setStats(result.stats);
        } catch (err) {
            console.error("Error loading stats:", err);
        }
    }, [filters.accountId]);

    useEffect(() => {
        loadStats();
    }, [loadStats, refreshTrigger]);

    const loadPosts = useCallback(async (reset = false, lastId = null) => {
        try {
            setLoading(true);
            const result = await getTiktokPosts({
                pageSize: pagination.pageSize,
                lastDocId: reset ? null : lastId,
                filters: {
                    status: filters.status,
                    accountId: filters.accountId,
                    searchQuery: filters.searchQuery
                },
                sortBy: filters.sortBy === 'date' ? 'createdAt' : filters.sortBy,
                sortOrder: filters.sortOrder
            });

            if (result.success) {
                if (reset) setPosts(result.posts);
                else setPosts(prev => [...prev, ...result.posts]);

                setPagination(prev => ({
                    ...prev,
                    hasMore: result.hasMore,
                    lastPostId: result.lastPostId
                }));
            } else {
                toast.error(result.message || "Failed to load posts");
            }
        } catch (err) {
            toast.error("An error occurred while loading posts");
            console.error("Error loading posts:", err);
        } finally {
            setLoading(false);
        }
    }, [filters, pagination.pageSize]);

    useEffect(() => {
        loadPosts(true);
    }, [loadPosts, refreshTrigger]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            status: "all",
            accountId: initialAccountId || "all",
            searchQuery: "",
            sortBy: "date",
            sortOrder: "desc"
        });
    };

    const handleDelete = async (postId) => {
        try {
            setDeletingId(postId);
            const result = await deleteTiktokPost(postId);
            if (result.success) {
                toast.success("Post deleted successfully");
                loadPosts(true);
                loadStats();
            } else {
                toast.error(result.message);
            }
        } finally {
            setDeletingId(null);
        }
    };

    const formatNumber = (num) => {
        if (!num && num !== 0) return "0";
        if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
        if (num >= 1000) return (num / 1000).toFixed(1) + "K";
        return num.toString();
    };

    if (loading && posts.length === 0) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-32 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <Card key={i} className="overflow-hidden aspect-[9/16]">
                            <Skeleton className="h-full w-full" />
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <Card className="p-4 flex flex-col items-center justify-center gap-1">
                        <span className="text-2xl font-black">{stats.totalPosts}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Posts</span>
                    </Card>
                    <Card className="p-4 flex flex-col items-center justify-center gap-1">
                        <span className="text-2xl font-black">{formatNumber(stats.totalLikes)}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Likes</span>
                    </Card>
                    <Card className="p-4 flex flex-col items-center justify-center gap-1">
                        <span className="text-2xl font-black">{formatNumber(stats.totalComments)}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Comments</span>
                    </Card>
                    <Card className="p-4 flex flex-col items-center justify-center gap-1">
                        <span className="text-2xl font-black">{formatNumber(stats.totalShares)}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Shares</span>
                    </Card>
                    <Card className="p-4 flex flex-col items-center justify-center gap-1">
                        <span className="text-2xl font-black">{formatNumber(stats.totalViews)}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Views</span>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <Card className="p-4 flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search posts..."
                        className="pl-9"
                        value={filters.searchQuery}
                        onChange={(e) => handleFilterChange("searchQuery", e.target.value)}
                    />
                </div>
                <Select value={filters.status} onValueChange={(v) => handleFilterChange("status", v)}>
                    <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={filters.accountId} onValueChange={(v) => handleFilterChange("accountId", v)}>
                    <SelectTrigger className="w-[200px]"><SelectValue placeholder="Account" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Accounts</SelectItem>
                        {accounts.map(acc => (
                            <SelectItem key={acc.id} value={acc.id}>{acc.username}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" onClick={clearFilters}><X className="h-4 w-4" /></Button>
            </Card>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {posts.map((post) => (
                    <Card key={post.id} className="group relative aspect-[9/16] overflow-hidden bg-black rounded-2xl shadow-lg border-none">
                        {post.content?.media?.[0]?.url ? (
                            <video
                                src={post.content.media[0].url}
                                className="w-full h-full object-cover"
                                muted
                                onMouseOver={e => e.target.play()}
                                onMouseOut={e => { e.target.pause(); e.target.currentTime = 0; }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-900">
                                <TiktokLogo className="h-12 w-12 text-gray-800" />
                            </div>
                        )}

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 p-4 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <Badge className={cn("bg-black/50 backdrop-blur-md border-none", post.status === 'published' ? "text-green-400" : "text-purple-400")}>
                                    {post.status}
                                </Badge>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-black/20 hover:bg-black/40 text-white border-none">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onEdit?.(post)}>
                                            <Edit className="h-4 w-4 mr-2" /> Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(post.id)}>
                                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className="space-y-2">
                                <p className="text-white text-sm font-medium line-clamp-2">{post.content?.text}</p>
                                <div className="flex items-center gap-4 text-white/80">
                                    <div className="flex items-center gap-1 text-[10px] font-bold">
                                        <Heart className="h-3 w-3 fill-white" /> {formatNumber(post.metrics?.likes)}
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] font-bold">
                                        <MessageCircle className="h-3 w-3 fill-white" /> {formatNumber(post.metrics?.comments)}
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] font-bold">
                                        <Share2 className="h-3 w-3 fill-white" /> {formatNumber(post.metrics?.shares)}
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] font-bold">
                                        <Play className="h-3 w-3 fill-white" /> {formatNumber(post.metrics?.views)}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                                    <Avatar className="h-5 w-5 border border-white/20">
                                        <AvatarImage src={accounts.find(a => a.id === post.accountId)?.profilePicture} />
                                        <AvatarFallback className="text-[8px] font-bold">T</AvatarFallback>
                                    </Avatar>
                                    <span className="text-[10px] font-bold text-white/60">@{accounts.find(a => a.id === post.accountId)?.username || 'tiktok'}</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {pagination.hasMore && (
                <div className="flex justify-center pt-6">
                    <Button onClick={() => loadPosts(false, pagination.lastPostId)} disabled={loading} variant="outline">
                        Load More Videos <History className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
