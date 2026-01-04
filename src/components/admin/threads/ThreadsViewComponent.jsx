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
    Search, TrendingUp, Heart, MessageCircle, Eye, ChevronRight, X, Filter,
    Layers, ImageIcon, Film, Play, Edit, MoreVertical, Send, Trash2, History, Loader2, BarChart3
} from "lucide-react";
import { getThreadsPosts, getThreadsPostsStats, publishThreadsPostNow } from "@/app/actions/social/threads/threadsPostsActions";
import { getUserThreadsAccounts } from "@/app/actions/social/threads/createPost";
import { ThreadsLogo } from "@/components/icons/ThreadsLogo";

export default function ThreadsViewComponent({
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
        postType: "all",
        accountId: initialAccountId || "all",
        searchQuery: "",
        dateFrom: null,
        dateTo: null,
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
            if (initialAccountId && initialAccountId !== "all") return;
            const result = await getUserThreadsAccounts();
            if (result.success) setAccounts(result.accounts || []);
        };
        loadAccounts();
    }, [initialAccountId]);

    const loadStats = useCallback(async () => {
        try {
            const result = await getThreadsPostsStats({ accountId: filters.accountId });
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
            const result = await getThreadsPosts({
                pageSize: pagination.pageSize,
                lastDocId: reset ? null : lastId,
                filters: {
                    status: filters.status,
                    accountId: filters.accountId,
                    postType: filters.postType,
                    searchQuery: filters.searchQuery,
                    dateFrom: filters.dateFrom,
                    dateTo: filters.dateTo
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
            postType: "all",
            accountId: initialAccountId || "all",
            searchQuery: "",
            dateFrom: null,
            dateTo: null,
            sortBy: "date",
            sortOrder: "desc"
        });
    };

    const handleLoadMore = () => {
        if (pagination.hasMore && pagination.lastPostId) {
            loadPosts(false, pagination.lastPostId);
        }
    };

    const onEditClick = (post, action = 'edit') => {
        if (onEdit) onEdit(post, action);
    };

    const handlePublishNow = async (e, post) => {
        e.stopPropagation();
        try {
            setPublishingId(post.id);
            const result = await publishThreadsPostNow(post.id);
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <Card key={i} className="overflow-hidden">
                            <Skeleton className="aspect-square w-full" />
                            <CardContent className="p-4 space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <Card className="bg-gradient-to-r from-zinc-50 via-white to-zinc-100 border border-gray-200 shadow-sm">
                <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black text-white">
                                    <ThreadsLogo className="h-5 w-5 fill-white" />
                                </div>
                                <CardTitle className="text-2xl font-bold text-gray-900">
                                    Threads Activity
                                </CardTitle>
                            </div>
                            <CardDescription className="text-gray-600 pl-13">
                                Detailed insights and performance of your Threads content
                            </CardDescription>
                        </div>
                        {stats && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full lg:w-auto">
                                <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                            <Layers className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-xl font-bold text-gray-900">{stats.totalPosts || 0}</div>
                                            <div className="text-xs text-gray-500">Total Posts</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                                            <Heart className="h-4 w-4 text-red-600" />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-xl font-bold text-gray-900">{formatNumber(stats.totalLikes || 0)}</div>
                                            <div className="text-xs text-gray-500">Likes</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                            <MessageCircle className="h-4 w-4 text-green-600" />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-xl font-bold text-gray-900">{formatNumber(stats.totalReplies || 0)}</div>
                                            <div className="text-xs text-gray-500">Replies</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                                            <TrendingUp className="h-4 w-4 text-purple-600" />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-xl font-bold text-gray-900">{stats.avgEngagement || 0}</div>
                                            <div className="text-xs text-gray-500">Avg. Eng.</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Advanced Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="space-y-6">
                        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                            <div className="flex-1 w-full">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        placeholder="Search threads by content..."
                                        value={filters.searchQuery}
                                        onChange={(e) => handleFilterChange("searchQuery", e.target.value)}
                                        className="pl-9 w-full lg:w-96"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button variant="outline" size="sm" onClick={clearFilters} className="gap-2">
                                    <X className="h-4 w-4" /> Clear Filters
                                </Button>
                            </div>
                        </div>
                        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                            <div className="flex-1 flex flex-wrap gap-3">
                                <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                                    <SelectTrigger className="w-full lg:w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="published">Published</SelectItem>
                                        <SelectItem value="scheduled">Scheduled</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={filters.accountId} onValueChange={(value) => handleFilterChange("accountId", value)}>
                                    <SelectTrigger className="w-full lg:w-[200px]"><SelectValue placeholder="Threads Account" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Accounts</SelectItem>
                                        {accounts.map((account) => (
                                            <SelectItem key={account.accountId} value={account.accountId}>
                                                <div className="flex items-center gap-2">
                                                    <span className="truncate">{account.username}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {/* Active Filters */}
                        {(filters.status !== "all" || filters.accountId !== "all" || filters.searchQuery) && (
                            <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-600">Active filters:</span>
                                {filters.status !== "all" && <Badge variant="secondary" className="gap-1 capitalize">Status: {filters.status} <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("status", "all")} /></Badge>}
                                {filters.accountId !== "all" && <Badge variant="secondary" className="gap-1">Account: {accounts.find(p => p.accountId === filters.accountId)?.username || filters.accountId} <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("accountId", "all")} /></Badge>}
                                {filters.searchQuery && <Badge variant="secondary" className="gap-1">Search: {filters.searchQuery} <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("searchQuery", "")} /></Badge>}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Content */}
            {posts.length === 0 && !loading ? (
                <Card className="border-dashed">
                    <CardContent className="p-12 text-center">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <Filter className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{filters.searchQuery ? "No matching threads found" : "No threads available"}</h3>
                        <p className="text-muted-foreground mb-6">{filters.searchQuery ? "Try adjusting your search or filters" : "Start by creating a thread"}</p>
                        <Button onClick={clearFilters} variant="outline">Clear All Filters</Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {posts.map((post) => {
                        const media = post.mediaUrls || (post.mediaUrl ? [{ url: post.mediaUrl, type: post.mediaType }] : []);
                        const hasMedia = media.length > 0;
                        const message = post.message || post.content?.text || post.caption || "";

                        return (
                            <Card key={post.id} className={cn("group relative border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden bg-white aspect-square flex flex-col cursor-pointer", publishingId === post.id && "opacity-70 pointer-events-none")} onClick={() => onEditClick(post)}>
                                <div className="absolute inset-0 z-0 bg-gray-50">
                                    {hasMedia ? (
                                        <>
                                            {media[0].type?.startsWith('video') || post.mediaType === 'VIDEO' ? (
                                                <div className="w-full h-full bg-black relative">
                                                    <video src={media[0].url} className="w-full h-full object-cover opacity-90" muted />
                                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                        <div className="bg-white/30 backdrop-blur-md p-3 rounded-full shadow-lg">
                                                            <Play className="h-6 w-6 text-white fill-white" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <img src={media[0].url} alt="Thread media" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                            )}
                                            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
                                            <p className="text-gray-900 text-xs font-semibold line-clamp-6 leading-relaxed">
                                                {message || "No content"}
                                            </p>
                                        </div>
                                    )}
                                    {publishingId === post.id && (
                                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
                                            <Loader2 className="h-8 w-8 animate-spin text-black" />
                                        </div>
                                    )}
                                </div>
                                <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-white shadow-sm hover:bg-gray-50 text-gray-700 border border-gray-100"><MoreVertical className="h-4 w-4" /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start" className="w-40">
                                            {post.status === 'published' ? (
                                                <>
                                                    <DropdownMenuItem onClick={() => onEditClick(post, 'analytics')}>
                                                        <BarChart3 className="mr-2 h-4 w-4 text-blue-600" />
                                                        <span className="font-semibold text-blue-600">Analytics</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => onEditClick(post)}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        <span>View Post</span>
                                                    </DropdownMenuItem>
                                                </>
                                            ) : (
                                                <>
                                                    <DropdownMenuItem onClick={() => onEditClick(post)}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        <span>Edit Post</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={(e) => handlePublishNow(e, post)} className="text-purple-600 focus:text-purple-700 focus:bg-purple-50">
                                                        <Send className="mr-2 h-4 w-4" />
                                                        <span>Publish Now</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600 focus:text-red-700 focus:bg-red-50" onClick={() => onEdit(post, 'delete')}>
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        <span>Delete Post</span>
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="absolute top-3 left-3 z-20 pointer-events-none flex flex-col items-start gap-1">
                                    {hasMedia && (
                                        <div className="bg-white/90 backdrop-blur-sm shadow-sm rounded-full px-2 py-1 flex items-center gap-1.5">
                                            {media[0].type?.startsWith('video') ? <Film className="h-3 w-3 text-purple-600" /> : <ImageIcon className="h-3 w-3 text-blue-600" />}
                                            <span className="text-[10px] font-semibold text-gray-700 capitalize">{media[0].type?.startsWith('video') ? 'Video' : 'Image'}</span>
                                        </div>
                                    )}
                                    <div className={cn("backdrop-blur-sm shadow-sm rounded-full px-2 py-1 flex items-center gap-1.5", post.status === 'published' ? "bg-green-100/90 text-green-700" : "bg-blue-100/90 text-blue-700")}>
                                        <span className="text-[10px] font-semibold capitalize">{post.status || 'published'}</span>
                                    </div>
                                </div>
                                <div className="absolute inset-x-0 bottom-0 p-3 z-10 pointer-events-none text-white">
                                    <div className="flex flex-col gap-1">
                                        <p className="text-xs line-clamp-2 leading-snug font-medium text-gray-100 drop-shadow-md">{message}</p>
                                        <div className="flex items-center gap-3 mt-1 text-[11px] font-medium text-gray-200">
                                            <div className="flex items-center gap-1"><Heart className="h-3 w-3 fill-white/20" /> {formatNumber(post.metrics?.likes)}</div>
                                            <div className="flex items-center gap-1"><MessageCircle className="h-3 w-3 fill-white/20" /> {formatNumber(post.metrics?.replies)}</div>
                                            <div className="flex items-center gap-1 ml-auto"><span className="text-xs text-white/80">{formatDate(post.createdAt)}</span></div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {pagination.hasMore && (
                <div className="flex justify-center pt-6">
                    <Button onClick={handleLoadMore} disabled={loading} variant="outline" size="lg" className="w-full sm:w-auto min-w-[200px]">
                        {loading ? "Loading..." : "Load More Activity"}
                        {!loading && <History className="ml-2 h-4 w-4" />}
                    </Button>
                </div>
            )}
        </div>
    );
}
