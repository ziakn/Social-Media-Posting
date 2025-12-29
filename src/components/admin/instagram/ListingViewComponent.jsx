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
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Search, TrendingUp, Heart, MessageCircle, Eye, ChevronRight, X, Filter,
    Layers, Play, Edit, MoreVertical, Send, Trash2, Loader2, Video, BarChart3
} from "lucide-react";
import { getPublishedPosts, getPublishedPostsStats } from "@/app/actions/social/instagram/getPosts";
import { fetchInstagramAccounts } from "@/app/actions/social/instagram/getPages";
import { publishInstagramPostNow } from "@/app/actions/social/instagram/publishPost";

export default function ListingViewComponent({
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

    const onEditClick = (post, action = 'edit') => {
        if (onEdit) onEdit(post, action);
    };

    const handlePublishNow = async (e, post) => {
        e.stopPropagation();
        try {
            setPublishingId(post.id);
            const result = await publishInstagramPostNow(post.id);
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
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Stats - Copied from InstagramView to keep consistency if user switches tabs */}
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
                <div className="rounded-md border bg-white overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                                <TableHead className="w-[100px]">Media</TableHead>
                                <TableHead>Caption</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Metrics</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {posts.map((post) => (
                                <TableRow key={post.id} className={cn("cursor-pointer hover:bg-gray-50", publishingId === post.id && "opacity-70 pointer-events-none")} onClick={() => onEditClick(post)}>
                                    <TableCell>
                                        <div className="h-16 w-16 rounded-md overflow-hidden bg-gray-100 border border-gray-200 relative">
                                            {post.mediaUrl ? (
                                                post.postType === 'video' ? (
                                                    <div className="w-full h-full bg-black relative">
                                                        <video src={post.mediaUrl} className="w-full h-full object-cover" muted />
                                                        <div className="absolute inset-0 flex items-center justify-center"><Play className="h-4 w-4 text-white fill-white" /></div>
                                                    </div>
                                                ) : (<img src={post.mediaUrl} alt="" className="h-full w-full object-cover" />)
                                            ) : (<div className="h-full w-full flex items-center justify-center text-xs text-gray-400">No Media</div>)}
                                            {publishingId === post.id && (
                                                <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                                    <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-[300px]">
                                        <div className="font-medium text-sm line-clamp-2">{post.caption || "No caption"}</div>
                                        <div className="flex items-center gap-2 mt-1">
                                            {post.postType && <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 capitalize">{post.postType}</Badge>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={post.status === 'published' ? 'default' : 'secondary'} className={cn("capitalize", post.status === 'published' ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-blue-100 text-blue-700 hover:bg-blue-100")}>{post.status || 'published'}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3 text-sm text-gray-600">
                                            <div className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> {formatNumber(post.metrics?.likes)}</div>
                                            <div className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" /> {formatNumber(post.metrics?.comments)}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-gray-500">
                                        {formatDate(post.status === 'scheduled' ? post.scheduledAt : post.createdAt)}
                                        <div className="text-[10px] text-gray-400">{format(new Date(post.status === 'scheduled' ? post.scheduledAt : post.createdAt), "h:mm a")}</div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="start" className="w-40">
                                                {post.status === 'published' ? (
                                                    <>
                                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEditClick(post, 'analytics'); }}>
                                                            <BarChart3 className="mr-2 h-4 w-4 text-blue-600" />
                                                            <span className="font-semibold text-blue-600">Analytics</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEditClick(post); }}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            <span>View Post</span>
                                                        </DropdownMenuItem>
                                                    </>
                                                ) : (
                                                    <>
                                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEditClick(post); }}>
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
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
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
