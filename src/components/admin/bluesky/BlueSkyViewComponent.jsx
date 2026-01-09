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
    Layers, ImageIcon, Film, Play, Edit, MoreVertical, Send, Trash2, History, Loader2, BarChart3,
    Check, Repeat2
} from "lucide-react";
import { getBlueSkyPosts, getBlueSkyPostsStats, publishBlueSkyPostNow, deleteBlueSkyPost } from "@/app/actions/social/bluesky/blueskyPostsActions";
import { getUserBlueSkyAccounts } from "@/app/actions/social/bluesky/createPost";
import { BlueSkyLogo } from "@/components/icons/BlueSkyLogo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import BlueSkyAnalyticsModal from "./BlueSkyAnalyticsModal";

export default function BlueSkyViewComponent({
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

    // Analytics Modal State
    const [analyticsModalOpen, setAnalyticsModalOpen] = useState(false);
    const [selectedPostForAnalytics, setSelectedPostForAnalytics] = useState(null);

    useEffect(() => {
        const loadAccounts = async () => {
            if (initialAccountId && initialAccountId !== "all") return;
            const result = await getUserBlueSkyAccounts();
            if (result.success) setAccounts(result.accounts || []);
        };
        loadAccounts();
    }, [initialAccountId]);

    const loadStats = useCallback(async () => {
        try {
            const result = await getBlueSkyPostsStats({ accountId: filters.accountId });
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
            const result = await getBlueSkyPosts({
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

    const handleOpenAnalytics = (post) => {
        const account = accounts.find(a => a.accountId === post.accountId);
        const enrichedPost = {
            ...post,
            username: account?.username || post.username || "BlueSky User",
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
            const result = await publishBlueSkyPostNow(post.id);
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
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0085ff] text-white">
                                    <BlueSkyLogo className="h-5 w-5 fill-white" />
                                </div>
                                <CardTitle className="text-2xl font-bold text-gray-900">
                                    BlueSky Activity
                                </CardTitle>
                            </div>
                            <CardDescription className="text-gray-600 pl-13">
                                Detailed insights and performance of your BlueSky content
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
                                        placeholder="Search bluesky by content..."
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
                                    <SelectTrigger className="w-full lg:w-[200px]"><SelectValue placeholder="BlueSky Account" /></SelectTrigger>
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
                        <h3 className="text-lg font-semibold mb-2">{filters.searchQuery ? "No matching bluesky found" : "No bluesky available"}</h3>
                        <p className="text-muted-foreground mb-6">{filters.searchQuery ? "Try adjusting your search or filters" : "Start by creating a thread"}</p>
                        <Button onClick={clearFilters} variant="outline">Clear All Filters</Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map((post) => {
                        const media = post.mediaUrls || post.content?.media || (post.mediaUrl ? [{ url: post.mediaUrl, type: post.mediaType }] : []) || [];
                        const hasMedia = media.length > 0;
                        const message = post.message || post.content?.text || post.caption || "";
                        const name = accounts.find(a => a.accountId === post.accountId)?.username || post.username || "BlueSky User";

                        return (
                            <Card key={post.id} className={cn("group relative border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 bg-white p-5 cursor-pointer rounded-2xl", publishingId === post.id && "opacity-70 pointer-events-none")} onClick={() => handleEdit(post)}>
                                <div className="flex gap-3 lg:gap-4 relative">
                                    {/* Left: Avatar & Vertical Line */}
                                    <div className="flex flex-col items-center shrink-0 w-10 lg:w-12">
                                        <div className="relative">
                                            <Avatar className="h-10 w-10 lg:h-12 lg:h-12 border border-gray-50 shadow-sm">
                                                <AvatarImage src={post.profilePicture} />
                                                <AvatarFallback className="bg-gray-100 font-bold text-gray-400">
                                                    {name[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="absolute -bottom-1 -right-1 bg-[#0085ff] rounded-full p-1 border-2 border-white shadow-sm">
                                                <BlueSkyLogo className="h-2 w-2 text-white" />
                                            </div>
                                        </div>
                                        <div className="flex-1 w-[2px] bg-gray-100 my-2 rounded-full" />
                                        <div className="flex -space-x-1 mt-1 pb-1">
                                            {[1, 2].map(i => (
                                                <div key={i} className="w-3.5 h-3.5 rounded-full border border-white bg-gray-200" />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Right: Content */}
                                    <div className="flex-1 min-w-0 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-bold text-gray-900 text-[14px] lg:text-[15px] hover:underline cursor-pointer">
                                                    {name.toLowerCase().replace(/\s/g, '')}
                                                </span>
                                                <Check className="h-3 w-3 bg-[#0085ff] text-white rounded-full p-0.5" />
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-gray-400 text-xs font-medium">{formatDate(post.createdAt)}</span>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-gray-100 text-gray-400 hover:text-black"><MoreVertical className="h-4 w-4" /></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-[200px] rounded-[32px] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] border border-gray-100 p-2.5">
                                                        {post.status === 'published' ? (
                                                            <>
                                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleOpenAnalytics(post); }} className="flex items-center gap-3 p-3.5 cursor-pointer rounded-[20px] hover:bg-gray-50 transition-colors group">
                                                                    <BarChart3 className="h-5 w-5 text-gray-900" />
                                                                    <span className="font-bold text-[13px] text-gray-900">View Analytics</span>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(post); }} className="flex items-center gap-3 p-3.5 cursor-pointer rounded-[20px] hover:bg-gray-50 transition-colors group">
                                                                    <Eye className="h-5 w-5 text-gray-900" />
                                                                    <span className="font-bold text-[13px] text-gray-900">Post Details</span>
                                                                </DropdownMenuItem>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(post); }} className="flex items-center gap-3 p-3.5 cursor-pointer rounded-[20px] hover:bg-gray-50 transition-colors group">
                                                                    <Edit className="h-5 w-5 text-gray-900" />
                                                                    <span className="font-bold text-[13px] text-gray-900">Edit Post</span>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={(e) => handlePublishNow(e, post)} className="flex items-center gap-3 p-3.5 cursor-pointer rounded-[20px] hover:bg-purple-50 transition-colors group">
                                                                    <Send className="h-5 w-5 text-purple-600" />
                                                                    <span className="font-bold text-[13px] text-purple-600">Publish Now</span>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="flex items-center gap-3 p-3.5 cursor-pointer rounded-[20px] hover:bg-red-50 transition-colors group" onClick={(e) => { e.stopPropagation(); handleEdit(post, 'delete'); }}>
                                                                    <Trash2 className="h-5 w-5 text-red-600" />
                                                                    <span className="font-bold text-[13px] text-red-600">Delete Post</span>
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>

                                        {message && (
                                            <p className="text-gray-900 text-[14px] lg:text-[15px] leading-relaxed whitespace-pre-wrap font-medium">
                                                {message}
                                            </p>
                                        )}

                                        {hasMedia && (
                                            <div className="relative rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex max-h-[400px]">
                                                {media[0].type?.startsWith('video') || post.mediaType === 'VIDEO' ? (
                                                    <div className="w-full h-full relative group/media">
                                                        <video src={media[0].url} className="w-full h-full object-cover" muted />
                                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/media:opacity-100 transition-opacity">
                                                            <div className="bg-black/40 backdrop-blur-md p-3 rounded-full shadow-lg">
                                                                <Play className="h-6 w-6 text-white fill-white" />
                                                            </div>
                                                        </div>
                                                        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm p-1.5 rounded-lg">
                                                            <Film className="h-3.5 w-3.5 text-white" />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="relative w-full h-full group/media">
                                                        <img src={media[0].url} alt="Thread media" className="w-full h-full object-cover rounded-xl" />
                                                        {media.length > 1 && (
                                                            <div className="absolute top-3 right-3 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm font-bold">
                                                                1/{media.length}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-5 pt-1 text-gray-900">
                                            <div className="flex items-center gap-1.5 group/action">
                                                <Heart className="h-[20px] w-[20px] stroke-[1.5] group-hover/action:text-red-500 transition-colors" />
                                                <span className="text-xs font-bold text-gray-400 group-hover/action:text-red-500">{formatNumber(post.metrics?.likes)}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 group/action">
                                                <MessageCircle className="h-[20px] w-[20px] stroke-[1.5] group-hover/action:text-blue-500 transition-colors" />
                                                <span className="text-xs font-bold text-gray-400 group-hover/action:text-blue-500">{formatNumber(post.metrics?.replies)}</span>
                                            </div>
                                            <Repeat2 className="h-[20px] w-[20px] stroke-[1.5] hover:text-green-500 transition-colors" />
                                            <Send className="h-[20px] w-[20px] stroke-[1.5] hover:text-gray-500 transition-colors" />
                                        </div>

                                        <div className="flex items-center gap-2 pt-1">
                                            <Badge variant="secondary" className={cn("text-[10px] font-black uppercase tracking-wider rounded-md h-5 px-1.5", post.status === 'published' ? "bg-green-50 text-green-600 border-green-100" : "bg-purple-50 text-purple-600 border-purple-100")}>
                                                {post.status || 'published'}
                                            </Badge>
                                            {post.scheduledAt && (
                                                <Badge variant="secondary" className="bg-gray-50 text-gray-500 border-gray-100 text-[10px] font-black uppercase tracking-wider rounded-md h-5 px-1.5">
                                                    Scheduled
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {publishingId === post.id && (
                                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-50 rounded-2xl">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="h-8 w-8 animate-spin text-black" />
                                            <span className="text-xs font-black uppercase tracking-widest text-black">Publishing...</span>
                                        </div>
                                    </div>
                                )}
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
            {/* Analytics Modal */}
            <BlueSkyAnalyticsModal
                open={analyticsModalOpen}
                onOpenChange={setAnalyticsModalOpen}
                post={selectedPostForAnalytics}
            />
        </div>
    );
}
