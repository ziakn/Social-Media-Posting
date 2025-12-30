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
    Layers, ImageIcon, Film, Play, Edit, MoreVertical, Send, Trash2, History, Loader2, BarChart3, Share2, Facebook
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
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Stats */}
            <Card className="bg-gradient-to-r from-blue-50 via-white to-indigo-50 border border-gray-200 shadow-sm">
                <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 shadow-lg shadow-blue-100">
                                    <TrendingUp className="h-5 w-5 text-white" />
                                </div>
                                <CardTitle className="text-2xl font-black text-gray-900">
                                    Facebook Presence
                                </CardTitle>
                            </div>
                            <CardDescription className="text-gray-600 pl-13 font-medium">
                                Analyze your Facebook impact and audience engagement
                            </CardDescription>
                        </div>
                        {stats && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full lg:w-auto">
                                <div className="bg-white/80 backdrop-blur-sm border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center"><Layers className="h-4 w-4 text-blue-600" /></div>
                                        <div className="text-left">
                                            <div className="text-xl font-black text-gray-900">{stats.totalPosts || 0}</div>
                                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Posts</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white/80 backdrop-blur-sm border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center"><Eye className="h-4 w-4 text-indigo-600" /></div>
                                        <div className="text-left">
                                            <div className="text-xl font-black text-gray-900">{formatNumber(stats.totalReach || 0)}</div>
                                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Reach</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white/80 backdrop-blur-sm border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center"><Heart className="h-4 w-4 text-blue-600" /></div>
                                        <div className="text-left">
                                            <div className="text-xl font-black text-gray-900">{formatNumber(stats.totalEngagements || 0)}</div>
                                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Engaged</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white/80 backdrop-blur-sm border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-cyan-100 flex items-center justify-center"><BarChart3 className="h-4 w-4 text-cyan-600" /></div>
                                        <div className="text-left">
                                            <div className="text-xl font-black text-gray-900">{stats.avgEngagementRate || 0}%</div>
                                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Avg Rate</div>
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
                            <div className="flex-1 w-full relative group">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-blue-500 transition-colors" />
                                <Input
                                    placeholder="Search posts..."
                                    value={filters.searchQuery}
                                    onChange={(e) => handleFilterChange("searchQuery", e.target.value)}
                                    className="pl-9 w-full lg:w-96 rounded-xl border-gray-200 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2 text-gray-500 hover:text-blue-600 rounded-lg">
                                    <X className="h-4 w-4" /> Reset
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
                            <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange("sortBy", value)}>
                                <SelectTrigger className="w-[160px] rounded-xl"><SelectValue placeholder="Sort By" /></SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="newest">Newest First</SelectItem>
                                    <SelectItem value="oldest">Oldest First</SelectItem>
                                    <SelectItem value="engagement_high">High Engagement</SelectItem>
                                    <SelectItem value="reach_high">Top Reach</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {posts.map((post) => {
                        const firstMedia = post.mediaUrls?.[0]?.url;
                        return (
                            <Card key={post.id} className={cn("group relative border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden bg-white aspect-square flex flex-col cursor-pointer rounded-2xl", publishingId === post.id && "opacity-70 pointer-events-none")} onClick={() => onEditClick(post)}>
                                <div className="absolute inset-0 z-0 bg-gray-50 transition-transform duration-700 group-hover:scale-105">
                                    {firstMedia ? (
                                        <>
                                            {post.postType === 'video' ? (
                                                <div className="w-full h-full bg-black relative">
                                                    <video src={firstMedia} className="w-full h-full object-cover opacity-90" muted />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="bg-white/30 backdrop-blur-md p-3 rounded-full shadow-lg border border-white/20"><Play className="h-6 w-6 text-white fill-white" /></div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <img src={firstMedia} alt="" className="w-full h-full object-cover" />
                                            )}
                                            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-blue-50 p-6 text-center">
                                            <Facebook className="h-10 w-10 text-blue-100 mb-2" />
                                            <p className="text-xs font-bold text-blue-300 uppercase tracking-widest">Text Post</p>
                                        </div>
                                    )}
                                    {publishingId === post.id && (
                                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10 backdrop-blur-[2px]">
                                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                        </div>
                                    )}
                                </div>

                                <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0" onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-white shadow-lg hover:bg-gray-50 text-gray-700 border-none"><MoreVertical className="h-4 w-4" /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-xl border-gray-100 p-1">
                                            {post.status === 'published' ? (
                                                <>
                                                    <DropdownMenuItem onClick={() => onEditClick(post)} className="rounded-lg gap-2">
                                                        <Eye className="h-4 w-4" /> View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => onEditClick(post, 'analytics')} className="rounded-lg gap-2 text-blue-600 focus:text-blue-700">
                                                        <BarChart3 className="h-4 w-4" /> View Analytics
                                                    </DropdownMenuItem>
                                                </>
                                            ) : (
                                                <>
                                                    <DropdownMenuItem onClick={() => onEditClick(post)} className="rounded-lg gap-2"><Edit className="h-4 w-4" /> Edit Post</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={(e) => handlePublishNow(e, post)} className="text-blue-600 focus:text-blue-700 focus:bg-blue-50 rounded-lg gap-2"><Send className="h-4 w-4" /> Publish Now</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => onEditClick(post, 'delete')} className="text-red-600 focus:text-red-700 focus:bg-red-50 rounded-lg gap-2"><Trash2 className="h-4 w-4" /> Delete Post</DropdownMenuItem>
                                                </>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="absolute top-3 left-3 z-20 flex flex-col items-start gap-1.5 pointer-events-none">
                                    <div className="bg-white/90 backdrop-blur-sm shadow-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 border border-white/50">
                                        {post.postType === 'video' ? <Film className="h-3 w-3 text-indigo-600" /> :
                                            post.postType === 'images' ? <ImageIcon className="h-3 w-3 text-blue-600" /> :
                                                post.postType === 'carousel' ? <Layers className="h-3 w-3 text-blue-600" /> :
                                                    <History className="h-3 w-3 text-blue-600" />}
                                        <span className="text-[9px] font-black uppercase tracking-wider text-gray-700">{post.postType || 'post'}</span>
                                    </div>
                                    <div className={cn("backdrop-blur-sm shadow-sm rounded-full px-2.5 py-1 text-[9px] font-black border border-white/50 uppercase tracking-wider", post.status === 'published' ? "bg-green-500/90 text-white" : "bg-blue-600/90 text-white")}>
                                        {post.status || 'published'}
                                    </div>
                                </div>

                                <div className="absolute inset-x-0 bottom-0 p-4 z-10 pointer-events-none">
                                    <div className="space-y-2">
                                        <p className="text-xs line-clamp-2 font-bold text-white drop-shadow-lg leading-snug">{post.message || post.caption || "No message content"}</p>
                                        <div className="flex items-center gap-4 text-[10px] font-black text-blue-50/90 drop-shadow-md">
                                            <div className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" /> {formatNumber(post.metrics?.likes)}</div>
                                            <div className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {formatNumber(post.metrics?.comments)}</div>
                                            <div className="flex items-center gap-1"><Share2 className="h-3 w-3" /> {formatNumber(post.metrics?.shares)}</div>
                                            <span className="ml-auto opacity-70">{formatDate(post.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {pagination.hasMore && (
                <div className="flex justify-center pt-8">
                    <Button onClick={handleLoadMore} disabled={loading} variant="outline" size="lg" className="rounded-2xl px-12 font-black border-2 border-blue-50 hover:bg-blue-50 hover:text-blue-600 transition-all">
                        {loading ? "Discovering..." : "Load More Experience"}
                        {!loading && <ChevronRight className="ml-2 h-4 w-4" />}
                    </Button>
                </div>
            )}
        </div>
    );
}
