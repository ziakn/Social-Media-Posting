// src/components/portal/tiktok/TiktokViewComponent.jsx
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
import { getTiktokPosts, getTiktokPostsStats, publishTiktokPostNow, deleteTiktokPost } from "@/app/actions/social/tiktok/tiktokPostsActions";
import { getUserTikTokAccounts } from "@/app/actions/social/tiktok/getAccounts";
import { TiktokLogo } from "@/components/icons/TiktokLogo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import TiktokAnalyticsModal from "./TiktokAnalyticsModal";

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
    const [publishingId, setPublishingId] = useState(null);

    const [filters, setFilters] = useState({
        status: initialStatus,
        accountId: initialAccountId || "all",
        searchQuery: "",
        sortBy: "date",
        sortOrder: "desc"
    });

    useEffect(() => {
        if (initialAccountId) {
            setFilters(prev => ({ ...prev, accountId: initialAccountId }));
        }
    }, [initialAccountId]);

    const [pagination, setPagination] = useState({
        pageSize: 12,
        hasMore: false,
        lastPostId: null
    });

    // Analytics Modal State
    const [analyticsModalOpen, setAnalyticsModalOpen] = useState(false);
    const [selectedPostForAnalytics, setSelectedPostForAnalytics] = useState(null);

    useEffect(() => {
        const loadAccounts = async () => {
            if (initialAccountId && initialAccountId !== "all") return;
            const result = await getUserTikTokAccounts();
            if (result.success) setAccounts(result.accounts || []);
        };
        loadAccounts();
    }, [initialAccountId]);

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

    const handleLoadMore = () => {
        if (pagination.hasMore && pagination.lastPostId) {
            loadPosts(false, pagination.lastPostId);
        }
    };

    const handleOpenAnalytics = (post) => {
        const account = accounts.find(a => a.id === post.accountId);
        const enrichedPost = {
            ...post,
            username: account?.username || post.username || "TikTok User",
            profilePicture: account?.profilePicture || post.profilePicture
        };
        setSelectedPostForAnalytics(enrichedPost);
        setAnalyticsModalOpen(true);
    };

    const handleEdit = (post, action = 'edit') => {
        if (onEdit) onEdit(post, action);
    };

    const handlePublishNow = async (e, post) => {
        e.stopPropagation();
        try {
            setPublishingId(post.id);
            const result = await publishTiktokPostNow(post.id);
            if (result.success) {
                toast.success("Post published successfully!");
                if (onRefresh) onRefresh();
                else loadPosts(true);
            } else {
                toast.error(result.message || "Failed to publish post");
            }
        } catch (error) {
            toast.error("An error occurred while publishing");
        } finally {
            setPublishingId(null);
        }
    };

    const formatNumber = (num) => {
        if (!num && num !== 0) return "0";
        if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
        if (num >= 1000) return (num / 1000).toFixed(1) + "K";
        return num.toString();
    };

    const formatDate = (date) => {
        if (!date) return "N/A";
        try {
            return format(new Date(date), "MMM dd, yyyy");
        } catch {
            return "N/A";
        }
    };

    if (loading && posts.length === 0) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-32 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <Card key={i} className="overflow-hidden aspect-[9/16] rounded-2xl">
                            <Skeleton className="h-full w-full" />
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <Card className="bg-gradient-to-r from-zinc-50 via-white to-zinc-100 border border-gray-200 shadow-sm rounded-2xl">
                <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black text-white">
                                    <TiktokLogo className="h-5 w-5 bg-white rounded-sm" />
                                </div>
                                <CardTitle className="text-2xl font-bold text-gray-900">
                                    TikTok Activity
                                </CardTitle>
                            </div>
                            <CardDescription className="text-gray-600 pl-13 font-medium">
                                Detailed insights and performance of your TikTok videos
                            </CardDescription>
                        </div>
                        {stats && (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full lg:w-auto">
                                <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                            <Layers className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-xl font-bold text-gray-900 leading-none">{formatNumber(stats.totalPosts)}</div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Posts</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                                            <Heart className="h-4 w-4 text-red-600" />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-xl font-bold text-gray-900 leading-none">{formatNumber(stats.totalLikes)}</div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Likes</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                            <MessageCircle className="h-4 w-4 text-green-600" />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-xl font-bold text-gray-900 leading-none">{formatNumber(stats.totalComments)}</div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Comments</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                                            <Share2 className="h-4 w-4 text-orange-600" />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-xl font-bold text-gray-900 leading-none">{formatNumber(stats.totalShares)}</div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Shares</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hidden lg:block">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                                            <Play className="h-4 w-4 text-purple-600" />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-xl font-bold text-gray-900 leading-none">{formatNumber(stats.totalViews)}</div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Views</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Advanced Filters */}
            <Card className="rounded-2xl shadow-sm border border-gray-100">
                <CardContent className="p-6">
                    <div className="space-y-6">
                        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                            <div className="flex-1 w-full">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        placeholder="Search videos by description..."
                                        value={filters.searchQuery}
                                        onChange={(e) => handleFilterChange("searchQuery", e.target.value)}
                                        className="pl-9 w-full lg:w-96 rounded-xl border-gray-200"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button variant="outline" size="sm" onClick={clearFilters} className="gap-2 rounded-xl h-10 font-bold">
                                    <X className="h-4 w-4" /> Clear Filters
                                </Button>
                            </div>
                        </div>
                        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                            <div className="flex-1 flex flex-wrap gap-3">
                                <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                                    <SelectTrigger className="w-full lg:w-[150px] rounded-xl border-gray-200 h-10 font-bold"><SelectValue placeholder="Status" /></SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="published">Published</SelectItem>
                                        <SelectItem value="scheduled">Scheduled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {/* Active Filters */}
                        {(filters.status !== "all" || filters.accountId !== "all" || filters.searchQuery) && (
                            <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active filters:</span>
                                {filters.status !== "all" && <Badge variant="secondary" className="gap-1 capitalize rounded-lg bg-white border border-gray-200 text-gray-700 h-7 font-bold">Status: {filters.status} <X className="h-3 w-3 cursor-pointer hover:text-black" onClick={() => handleFilterChange("status", "all")} /></Badge>}
                                {filters.accountId !== "all" && <Badge variant="secondary" className="gap-1 rounded-lg bg-white border border-gray-200 text-gray-700 h-7 font-bold">Account: @{accounts.find(p => p.id === filters.accountId)?.username || filters.accountId} <X className="h-3 w-3 cursor-pointer hover:text-black" onClick={() => handleFilterChange("accountId", "all")} /></Badge>}
                                {filters.searchQuery && <Badge variant="secondary" className="gap-1 rounded-lg bg-white border border-gray-200 text-gray-700 h-7 font-bold px-2.5">Search: {filters.searchQuery} <X className="h-3 w-3 cursor-pointer hover:text-black" onClick={() => handleFilterChange("searchQuery", "")} /></Badge>}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Content Grid */}
            {posts.length === 0 && !loading ? (
                <Card className="border-dashed py-20 rounded-3xl">
                    <CardContent className="text-center">
                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                            <TiktokLogo className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{filters.searchQuery ? "No matching videos found" : "No videos available"}</h3>
                        <p className="text-gray-500 mb-8 max-w-xs mx-auto font-medium">{filters.searchQuery ? "Try adjusting your search or filters to find what you're looking for." : "Start by creating and scheduling your first TikTok masterpiece."}</p>
                        <Button onClick={clearFilters} variant="outline" className="rounded-xl font-bold h-11 px-6">Clear All Filters</Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {posts.map((post) => {
                        const media = post.content?.media || (post.mediaUrl ? [{ url: post.mediaUrl, type: post.mediaType }] : []) || [];
                        const hasMedia = media.length > 0;
                        const account = accounts.find(a => a.id === post.accountId);

                        return (
                            <Card key={post.id} className={cn("group relative aspect-[9/16] overflow-hidden bg-black rounded-3xl shadow-lg border-none hover:shadow-2xl transition-all duration-500 cursor-pointer scale-100 hover:scale-[1.02]", publishingId === post.id && "opacity-70 pointer-events-none")} onClick={() => handleEdit(post)}>
                                {hasMedia ? (
                                    <video
                                        src={media[0].url}
                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                        muted
                                        onMouseOver={e => e.target.play()}
                                        onMouseOut={e => { e.target.pause(); e.target.currentTime = 0; }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                                        <TiktokLogo className="h-16 w-16 text-gray-800" />
                                    </div>
                                )}

                                {/* Premium Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40 p-5 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <Badge className={cn("bg-black/40 backdrop-blur-xl border-none font-black uppercase tracking-widest text-[10px] h-6 px-3 rounded-full", post.status === 'published' ? "text-green-400" : "text-purple-400")}>
                                            {post.status}
                                        </Badge>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-black/20 hover:bg-black/60 text-white border-none backdrop-blur-md transition-all" onClick={(e) => e.stopPropagation()}>
                                                    <MoreVertical className="h-5 w-5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-[200px] rounded-[24px] shadow-2xl border border-gray-100 p-2">
                                                {post.status === 'published' ? (
                                                    <>
                                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleOpenAnalytics(post); }} className="flex items-center gap-3 p-3.5 cursor-pointer rounded-[18px] hover:bg-gray-50 transition-colors group">
                                                            <BarChart3 className="h-5 w-5 text-gray-900" />
                                                            <span className="font-bold text-[13px] text-gray-900">View Analytics</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(post); }} className="flex items-center gap-3 p-3.5 cursor-pointer rounded-[18px] hover:bg-gray-50 transition-colors group">
                                                            <Eye className="h-5 w-5 text-gray-900" />
                                                            <span className="font-bold text-[13px] text-gray-900">Deep Insights</span>
                                                        </DropdownMenuItem>
                                                    </>
                                                ) : (
                                                    <>
                                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(post); }} className="flex items-center gap-3 p-3.5 cursor-pointer rounded-[18px] hover:bg-gray-50 transition-colors group">
                                                            <Edit className="h-5 w-5 text-gray-900" />
                                                            <span className="font-bold text-[13px] text-gray-900">Edit Masterpiece</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={(e) => handlePublishNow(e, post)} className="flex items-center gap-3 p-3.5 cursor-pointer rounded-[18px] hover:bg-purple-50 transition-colors group">
                                                            <Send className="h-5 w-5 text-purple-600" />
                                                            <span className="font-bold text-[13px] text-purple-600">Publish Now</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="flex items-center gap-3 p-3.5 cursor-pointer rounded-[18px] hover:bg-red-50 transition-colors group" onClick={(e) => { e.stopPropagation(); handleEdit(post, 'delete'); }}>
                                                            <Trash2 className="h-5 w-5 text-red-600" />
                                                            <span className="font-bold text-[13px] text-red-600">Delete Masterpiece</span>
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-white text-[15px] font-bold leading-tight line-clamp-3 pr-2 drop-shadow-md">
                                            {post.content?.text || post.message}
                                        </p>

                                        <div className="flex items-center gap-4 text-white/90">
                                            <div className="flex flex-col items-center">
                                                <Heart className="h-4 w-4 fill-red-500 text-red-500 mb-1" />
                                                <span className="text-[10px] font-black">{formatNumber(post.metrics?.likes)}</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <MessageCircle className="h-4 w-4 fill-blue-500 text-blue-500 mb-1" />
                                                <span className="text-[10px] font-black">{formatNumber(post.metrics?.comments)}</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <Share2 className="h-4 w-4 fill-orange-500 text-orange-500 mb-1" />
                                                <span className="text-[10px] font-black">{formatNumber(post.metrics?.shares)}</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <Play className="h-4 w-4 fill-purple-500 text-purple-500 mb-1" />
                                                <span className="text-[10px] font-black">{formatNumber(post.metrics?.views)}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8 border-2 border-white/20 ring-1 ring-black/20 shadow-xl">
                                                    <AvatarImage src={accounts.find(a => a.accountId === post.accountId)?.profilePicture} />
                                                    <AvatarFallback className="bg-white/10 text-white font-black text-[10px]">@{accounts.find(a => a.accountId === post.accountId)?.username?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-black text-white hover:underline">@{account?.username || 'tiktok'}</span>
                                                    <span className="text-[9px] font-bold text-white/50">{formatDate(post.publishedAt || post.scheduledAt || post.createdAt)}</span>
                                                </div>
                                            </div>
                                            {post.status === 'published' && (
                                                <div className="p-1.5 bg-white/10 backdrop-blur-md rounded-lg group-hover:bg-white/20 transition-all">
                                                    <BarChart3 className="h-4 w-4 text-white" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Play Button Overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                        <div className="bg-white/20 backdrop-blur-2xl p-4 rounded-full shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-500">
                                            <Play className="h-8 w-8 text-white fill-white" />
                                        </div>
                                    </div>
                                </div>

                                {publishingId === post.id && (
                                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 rounded-3xl">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="h-12 w-12 rounded-full border-4 border-white/10 border-t-white animate-spin" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white animate-pulse">Publishing Video...</span>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div >
            )}

            {
                pagination.hasMore && (
                    <div className="flex justify-center pt-8">
                        <Button onClick={handleLoadMore} disabled={loading} variant="outline" size="lg" className="h-14 px-10 rounded-2xl border-gray-200 font-black uppercase tracking-widest text-xs hover:bg-black hover:text-white transition-all shadow-xl shadow-black/5 active:scale-95 gap-3">
                            {loading ? "Loading Masterpieces..." : "Discover More Activity"}
                            {!loading && <History className="h-5 w-5" />}
                        </Button>
                    </div>
                )
            }

            {/* Analytics Modal */}
            <TiktokAnalyticsModal
                open={analyticsModalOpen}
                onOpenChange={setAnalyticsModalOpen}
                post={selectedPostForAnalytics}
            />
        </div >
    );
}
