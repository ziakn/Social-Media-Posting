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
    Layers, ImageIcon, Film, Play, Edit, MoreVertical, Send, Trash2, History, Loader2, BarChart3, Share2, Facebook, ThumbsUp, Globe
} from "lucide-react";
import { getFacebookPosts, getUserFacebookPages, publishFacebookPostNow } from "@/app/actions/social/facebook/facebookPostsActions";

export default function FacebookViewComponent({
    pageId: initialPageId,
    initialStatus = "all",
    refreshTrigger = 0,
    onEdit = null
}) {
    const [posts, setPosts] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pages, setPages] = useState([]);
    const [publishingId, setPublishingId] = useState(null);

    const [filters, setFilters] = useState({
        status: initialStatus,
        postType: "all",
        pageId: initialPageId || "all",
        searchQuery: "",
        dateFrom: null,
        dateTo: null,
        sortBy: "newest",
        sortOrder: "desc"
    });

    const [pagination, setPagination] = useState({
        pageSize: 12,
        hasMore: false,
        lastVisible: null
    });

    useEffect(() => {
        const loadPages = async () => {
            const result = await getUserFacebookPages();
            if (result.success) setPages(result.pages);
        };
        loadPages();
    }, []);

    const loadPosts = useCallback(async (reset = false, lastId = null) => {
        try {
            setLoading(true);
            const result = await getFacebookPosts({
                pageSize: pagination.pageSize,
                lastDocId: reset ? null : lastId,
                filters: {
                    status: filters.status,
                    postType: filters.postType,
                    pageId: filters.pageId,
                    searchQuery: filters.searchQuery
                },
                sortBy: filters.sortBy
            });

            if (result.success) {
                if (reset) setPosts(result.posts);
                else setPosts(prev => [...prev, ...result.posts]);

                setStats(result.statistics);
                setPagination(prev => ({
                    ...prev,
                    hasMore: result.pagination?.hasMore || false,
                    lastVisible: result.pagination?.lastVisible || null
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
            sortBy: "newest",
            sortOrder: "desc"
        });
    };

    const handleLoadMore = () => {
        if (pagination.hasMore && pagination.lastVisible) {
            loadPosts(false, pagination.lastVisible);
        }
    };

    const onEditClick = (post, action = 'edit') => {
        if (onEdit) onEdit(post, action);
    };

    const handlePublishNow = async (e, post) => {
        e.stopPropagation();
        try {
            setPublishingId(post.id);
            const result = await publishFacebookPostNow(post.id);
            if (result.success) {
                toast.success("Post published successfully!");
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
            <Card className="bg-gradient-to-r from-blue-50 via-white to-indigo-50 border border-gray-200 shadow-sm">
                <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                                    <TrendingUp className="h-5 w-5 text-white" />
                                </div>
                                <CardTitle className="text-2xl font-bold text-gray-900">
                                    Facebook Presence
                                </CardTitle>
                            </div>
                            <CardDescription className="text-gray-600 pl-13">
                                Analyze your Facebook impact and audience engagement
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
                                            <div className="text-xl font-bold text-gray-900">{formatNumber(stats.totalEngagements || 0)}</div>
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
                                            <BarChart3 className="h-4 w-4 text-purple-600" />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-xl font-bold text-gray-900">{stats.avgEngagementRate || 0}%</div>
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
            <Card className="border-gray-100 shadow-sm">
                <CardContent className="p-6">
                    <div className="space-y-6">
                        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                            <div className="flex-1 w-full">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        placeholder="Search posts..."
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
                        <div className="flex flex-wrap gap-3">
                            <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                                <SelectTrigger className="w-[140px] rounded-xl"><SelectValue placeholder="Status" /></SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                    <SelectItem value="scheduled">Scheduled</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={filters.pageId} onValueChange={(value) => handleFilterChange("pageId", value)}>
                                <SelectTrigger className="w-[180px] rounded-xl"><SelectValue placeholder="Page" /></SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="all">All Pages</SelectItem>
                                    {pages.map((p) => (
                                        <SelectItem key={p.pageId} value={p.pageId}>{p.pageName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {/* Active Filters */}
                        {(filters.status !== "all" || filters.pageId !== "all" || filters.searchQuery) && (
                            <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-600">Active filters:</span>
                                {filters.status !== "all" && <Badge variant="secondary" className="gap-1">Status: {filters.status} <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("status", "all")} /></Badge>}
                                {filters.pageId !== "all" && <Badge variant="secondary" className="gap-1">Page: {pages.find(p => p.pageId === filters.pageId)?.pageName || filters.pageId} <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("pageId", "all")} /></Badge>}
                                {filters.searchQuery && <Badge variant="secondary" className="gap-1">Search: {filters.searchQuery} <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("searchQuery", "")} /></Badge>}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Content */}
            {posts.length === 0 && !loading ? (
                <Card className="border-dashed border-2 rounded-3xl">
                    <CardContent className="p-12 text-center">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Filter className="h-8 w-8 text-blue-200" />
                        </div>
                        <h3 className="text-xl font-black mb-2">No posts found</h3>
                        <p className="text-gray-500 mb-6">Try adjusting your filters or search terms</p>
                        <Button onClick={clearFilters} variant="outline" className="rounded-xl px-8">Clear All Filters</Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {posts.map((post) => {
                        const firstMedia = post.mediaUrls?.[0]?.url;
                        return (
                            <Card key={post.id} className={cn("group flex flex-col border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 bg-white rounded-xl overflow-hidden cursor-default", publishingId === post.id && "opacity-70 pointer-events-none")}>
                                {/* Header */}
                                <div className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-10 w-10 rounded-full bg-gray-100 border border-gray-100 overflow-hidden flex-shrink-0">
                                            {post.pageProfilePicture ? (
                                                <img src={post.pageProfilePicture} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600 font-bold">
                                                    {post.pageName?.[0] || 'F'}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-900 leading-tight hover:underline cursor-pointer">{post.pageName || "Facebook Page"}</span>
                                            <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium">
                                                <span>{formatDate(post.scheduledAt || post.createdAt)}</span>
                                                <span>•</span>
                                                <Globe className="h-2.5 w-2.5" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={cn("px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter", post.status === 'published' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700")}>
                                            {post.status || 'published'}
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-gray-100 text-gray-400 group-hover:text-gray-600"><MoreVertical className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-44 rounded-xl shadow-xl border-gray-100 p-1">
                                                {post.status === 'published' ? (
                                                    <>
                                                        <DropdownMenuItem onClick={() => onEditClick(post)} className="rounded-lg gap-2 text-xs font-bold">
                                                            <Eye className="h-4 w-4" /> View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => onEditClick(post, 'analytics')} className="rounded-lg gap-2 text-xs font-bold text-blue-600 focus:text-blue-700">
                                                            <BarChart3 className="h-4 w-4" /> View Analytics
                                                        </DropdownMenuItem>
                                                    </>
                                                ) : (
                                                    <>
                                                        <DropdownMenuItem onClick={() => onEditClick(post)} className="rounded-lg gap-2 text-xs font-bold"><Edit className="h-4 w-4" /> Edit Post</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={(e) => handlePublishNow(e, post)} className="rounded-lg gap-2 text-xs font-bold text-blue-600 focus:text-blue-700 focus:bg-blue-50"><Send className="h-4 w-4" /> Publish Now</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => onEditClick(post, 'delete')} className="rounded-lg gap-2 text-xs font-bold text-red-600 focus:text-red-700 focus:bg-red-50"><Trash2 className="h-4 w-4" /> Delete Post</DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                {/* Caption */}
                                <div className="px-4 pb-3" onClick={() => onEditClick(post)}>
                                    <p className="text-sm text-gray-800 line-clamp-3 whitespace-pre-wrap leading-relaxed">
                                        {post.message || post.caption || ""}
                                    </p>
                                </div>

                                {/* Media */}
                                <div className="relative bg-gray-50 border-y border-gray-50 cursor-pointer overflow-hidden" onClick={() => onEditClick(post)}>
                                    {firstMedia ? (
                                        <div className="aspect-video w-full flex items-center justify-center bg-black overflow-hidden">
                                            {post.postType === 'video' ? (
                                                <div className="w-full h-full relative group/media">
                                                    <video src={firstMedia} className="w-full h-full object-contain" muted />
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/media:opacity-100 transition-opacity bg-black/20">
                                                        <div className="bg-white/90 p-3 rounded-full shadow-lg"><Play className="h-6 w-6 text-gray-900 fill-gray-900" /></div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <img src={firstMedia} alt="" className="w-full h-full object-contain" />
                                            )}
                                        </div>
                                    ) : (
                                        <div className="py-12 flex flex-col items-center justify-center text-blue-100">
                                            <Facebook className="h-16 w-16 mb-2 opacity-50" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-200">Facebook Status Update</span>
                                        </div>
                                    )}

                                    {publishingId === post.id && (
                                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10 backdrop-blur-[2px]">
                                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                        </div>
                                    )}
                                </div>

                                {/* Footer / Engagements */}
                                <div className="p-3 border-t border-gray-100 bg-white">
                                    <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-100">
                                        <div className="flex items-center -space-x-1">
                                            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center ring-2 ring-white z-10">
                                                <ThumbsUp className="h-2.5 w-2.5 text-white fill-white" />
                                            </div>
                                            <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center ring-2 ring-white">
                                                <Heart className="h-2.5 w-2.5 text-white fill-white" />
                                            </div>
                                            <span className="ml-5 text-[11px] text-gray-500 font-medium">
                                                {post.metrics?.likes > 0 ? formatNumber(post.metrics.likes) : ""}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-[11px] text-gray-500">
                                            {post.metrics?.comments > 0 && <span>{formatNumber(post.metrics.comments)} comments</span>}
                                            {post.metrics?.shares > 0 && <span>{formatNumber(post.metrics.shares)} shares</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between px-1">
                                        <button className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md hover:bg-gray-100 transition-colors text-xs font-bold text-gray-600">
                                            <ThumbsUp className="h-4 w-4" /> Like
                                        </button>
                                        <button className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md hover:bg-gray-100 transition-colors text-xs font-bold text-gray-600">
                                            <MessageCircle className="h-4 w-4" /> Comment
                                        </button>
                                        <button className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md hover:bg-gray-100 transition-colors text-xs font-bold text-gray-600">
                                            <Share2 className="h-4 w-4" /> Share
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {pagination.hasMore && (
                <div className="flex justify-center pt-8">
                    <Button onClick={handleLoadMore} disabled={loading} variant="outline" size="lg" className="w-full sm:w-auto min-w-[200px]">
                        {loading ? "Loading..." : "Load More Posts"}
                        {!loading && <ChevronRight className="ml-2 h-4 w-4" />}
                    </Button>
                </div>
            )}
        </div>
    );
}
