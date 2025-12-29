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
    Layers, ImageIcon, Film, Play, Edit, MoreVertical, Send, Trash2, History, Loader2
} from "lucide-react";
import { getPublishedPosts, getPublishedPostsStats } from "@/app/actions/social/instagram/getPosts";
import { fetchInstagramAccounts } from "@/app/actions/social/instagram/getPages";
import { publishInstagramPostNow } from "@/app/actions/social/instagram/publishPost";

export default function InstagramViewComponent({
    pageId: initialPageId,
    initialStatus = "all",
    refreshTrigger = 0,
    onEdit = null
}) {
    const [posts, setPosts] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [accounts, setAccounts] = useState([]);
    const [publishingId, setPublishingId] = useState(null);

    const [filters, setFilters] = useState({
        status: initialStatus,
        postType: "all",
        pageId: initialPageId || "all",
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
            if (initialPageId) return;
            const result = await fetchInstagramAccounts();
            if (result.success) setAccounts(result.accounts);
        };
        loadAccounts();
    }, [initialPageId]);

    const loadStats = useCallback(async () => {
        try {
            const targetPageId = filters.pageId === "all" ? null : filters.pageId;
            const result = await getPublishedPostsStats({ pageId: targetPageId });
            if (result.success) setStats(result.stats);
        } catch (err) {
            console.error("Error loading stats:", err);
        }
    }, [filters.pageId]);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    const loadPosts = useCallback(async (reset = false, lastId = null) => {
        try {
            setLoading(true);
            const targetPageId = filters.pageId === "all" ? null : filters.pageId;

            const result = await getPublishedPosts({
                pageId: targetPageId,
                filters: {
                    status: filters.status,
                    postType: filters.postType,
                    searchQuery: filters.searchQuery,
                    dateFrom: filters.dateFrom,
                    dateTo: filters.dateTo
                },
                sorting: { sortBy: filters.sortBy, sortOrder: filters.sortOrder },
                pagination: { pageSize: pagination.pageSize, lastPostId: reset ? null : lastId }
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
            pageId: initialPageId || "all",
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

    const onEditClick = (post) => {
        if (onEdit) onEdit(post);
    };

    const handlePublishNow = async (e, post) => {
        e.stopPropagation();
        try {
            setPublishingId(post.id);
            const result = await publishInstagramPostNow(post.id);
            if (result.success) {
                toast.success("Post published successfully!");
                // We can't trigger a full parent refresh easily from here without props, 
                // but we can refresh local list. Best to assume parent might refresh or we refresh self.
                // For now, let's refresh self.
                loadPosts(true);
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
            <Card className="bg-gradient-to-r from-pink-50 via-white to-purple-50 border border-gray-200 shadow-sm">
                <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-600">
                                    <TrendingUp className="h-5 w-5 text-white" />
                                </div>
                                <CardTitle className="text-2xl font-bold text-gray-900">
                                    Published Posts
                                </CardTitle>
                            </div>
                            <CardDescription className="text-gray-600 pl-13">
                                Track performance and engagement across your Instagram posts
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
                                            <div className="text-xl font-bold text-gray-900">{formatNumber(stats.totalEngagement || 0)}</div>
                                            <div className="text-xs text-gray-500">Engagements</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                            <MessageCircle className="h-4 w-4 text-green-600" />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-xl font-bold text-gray-900">{formatNumber(stats.totalComments || 0)}</div>
                                            <div className="text-xs text-gray-500">Comments</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                                            <Eye className="h-4 w-4 text-purple-600" />
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
                                        placeholder="Search posts by caption..."
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
                                <Select value={filters.pageId} onValueChange={(value) => handleFilterChange("pageId", value)}>
                                    <SelectTrigger className="w-full lg:w-[200px]"><SelectValue placeholder="Instagram Page" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Pages</SelectItem>
                                        {accounts.map((account) => (
                                            <SelectItem key={account.igUserId} value={account.igUserId}>
                                                <div className="flex items-center gap-2">
                                                    <span className="truncate">{account.username || account.displayName}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {/* Active Filters */}
                        {(filters.status !== "all" || filters.pageId !== "all" || filters.searchQuery) && (
                            <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-600">Active filters:</span>
                                {filters.status !== "all" && <Badge variant="secondary" className="gap-1">Status: {filters.status} <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("status", "all")} /></Badge>}
                                {filters.pageId !== "all" && <Badge variant="secondary" className="gap-1">Page: {accounts.find(p => p.igUserId === filters.pageId)?.username || filters.pageId} <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("pageId", "all")} /></Badge>}
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
                        <h3 className="text-lg font-semibold mb-2">{filters.searchQuery ? "No matching posts found" : "No posts available"}</h3>
                        <p className="text-muted-foreground mb-6">{filters.searchQuery ? "Try adjusting your search or filters" : "Start by creating a post"}</p>
                        <Button onClick={clearFilters} variant="outline">Clear All Filters</Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {posts.map((post) => (
                        <Card key={post.id} className={cn("group relative border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden bg-white aspect-square flex flex-col cursor-pointer", publishingId === post.id && "opacity-70 pointer-events-none")} onClick={() => onEditClick(post)}>
                            <div className="absolute inset-0 z-0 bg-gray-50">
                                {post.mediaUrl ? (
                                    <>
                                        {post.postType === 'video' ? (
                                            <div className="w-full h-full bg-black relative">
                                                <video src={post.mediaUrl} className="w-full h-full object-cover opacity-90" muted />
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                    <div className="bg-white/30 backdrop-blur-md p-3 rounded-full shadow-lg">
                                                        <Play className="h-6 w-6 text-white fill-white" />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <img src={post.mediaUrl} alt="Post media" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                        )}
                                        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-50"><span className="text-gray-400">No Media</span></div>
                                )}
                                {publishingId === post.id && (
                                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
                                        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
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
                                            <DropdownMenuItem onClick={() => onEditClick(post)}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                <span>View Post</span>
                                            </DropdownMenuItem>
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
                                                {onEdit && (
                                                    <DropdownMenuItem className="text-red-600 focus:text-red-700 focus:bg-red-50" onClick={() => onEdit(post, 'delete')}>
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        <span>Delete Post</span>
                                                    </DropdownMenuItem>
                                                )}
                                            </>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <div className="absolute top-3 left-3 z-20 pointer-events-none flex flex-col items-start gap-1">
                                {post.postType && (
                                    <div className="bg-white/90 backdrop-blur-sm shadow-sm rounded-full px-2 py-1 flex items-center gap-1.5">
                                        {post.postType === 'video' ? <Film className="h-3 w-3 text-purple-600" /> :
                                            post.postType === 'image' ? <ImageIcon className="h-3 w-3 text-blue-600" /> :
                                                post.postType === 'carousel' ? <Layers className="h-3 w-3 text-orange-600" /> :
                                                    post.postType === 'story' ? <History className="h-3 w-3 text-pink-600" /> : null}
                                        <span className="text-[10px] font-semibold text-gray-700 capitalize">{post.postType}</span>
                                    </div>
                                )}
                                <div className={cn("backdrop-blur-sm shadow-sm rounded-full px-2 py-1 flex items-center gap-1.5", post.status === 'published' ? "bg-green-100/90 text-green-700" : "bg-blue-100/90 text-blue-700")}>
                                    <span className="text-[10px] font-semibold capitalize">{post.status || 'published'}</span>
                                </div>
                            </div>
                            <div className="absolute inset-x-0 bottom-0 p-3 z-10 pointer-events-none text-white">
                                <div className="flex flex-col gap-1">
                                    <p className="text-xs line-clamp-2 leading-snug font-medium text-gray-100 drop-shadow-md">{post.caption || "No caption"}</p>
                                    <div className="flex items-center gap-3 mt-1 text-[11px] font-medium text-gray-200">
                                        <div className="flex items-center gap-1"><Heart className="h-3 w-3 fill-white/20" /> {formatNumber(post.metrics?.likes)}</div>
                                        <div className="flex items-center gap-1"><MessageCircle className="h-3 w-3 fill-white/20" /> {formatNumber(post.metrics?.comments)}</div>
                                        <div className="flex items-center gap-1 ml-auto"><span className="text-xs text-white/80">{formatDate(post.createdAt)}</span></div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {pagination.hasMore && (
                <div className="flex justify-center pt-6">
                    <Button onClick={handleLoadMore} disabled={loading} variant="outline" size="lg" className="w-full sm:w-auto min-w-[200px]">
                        {loading ? "Loading..." : "Load More Posts"}
                        {!loading && <ChevronRight className="ml-2 h-4 w-4" />}
                    </Button>
                </div>
            )}
        </div>
    );
}
