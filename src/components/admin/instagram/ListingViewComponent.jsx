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
            {/* Header Stats */}
            {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-pink-50 flex items-center justify-center">
                                <Layers className="h-5 w-5 text-pink-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-black text-gray-900 leading-none mb-1">{stats.totalPosts || 0}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Instagram Posts</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center">
                                <Heart className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-black text-gray-900 leading-none mb-1">{formatNumber(stats.totalEngagement || 0)}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Engagements</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center">
                                <MessageCircle className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-black text-gray-900 leading-none mb-1">{formatNumber(stats.totalComments || 0)}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Comments</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center">
                                <TrendingUp className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-black text-gray-900 leading-none mb-1">{stats.avgEngagement || 0}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Avg. Engagement</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Advanced Filters */}
            <Card className="border-gray-100 shadow-sm">
                <CardContent className="p-4 space-y-4">
                    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                        <div className="w-full lg:w-96 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Search by caption..."
                                value={filters.searchQuery}
                                onChange={(e) => handleFilterChange("searchQuery", e.target.value)}
                                className="pl-9 rounded-xl border-gray-200"
                            />
                        </div>
                        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                            <Select value={filters.status} onValueChange={(v) => handleFilterChange("status", v)}>
                                <SelectTrigger className="w-[130px] rounded-xl"><SelectValue placeholder="Status" /></SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                    <SelectItem value="scheduled">Scheduled</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={filters.pageId} onValueChange={(v) => handleFilterChange("pageId", v)}>
                                <SelectTrigger className="w-[180px] rounded-xl"><SelectValue placeholder="Account" /></SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="all">All Accounts</SelectItem>
                                    {accounts.map((account) => (
                                        <SelectItem key={account.igUserId} value={account.igUserId}>
                                            {account.username || account.displayName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-500 hover:text-pink-600 rounded-lg">
                                <X className="h-4 w-4 mr-1" /> Reset
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Content */}
            {/* Table View */}
            <Card className="border-none shadow-none bg-transparent">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow className="hover:bg-transparent border-gray-100">
                                <TableHead className="w-[100px] font-bold">Media</TableHead>
                                <TableHead className="font-bold">Caption & Account</TableHead>
                                <TableHead className="font-bold">Status</TableHead>
                                <TableHead className="font-bold">Metrics</TableHead>
                                <TableHead className="font-bold">Date</TableHead>
                                <TableHead className="w-[100px] text-right"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {posts.map((post) => (
                                <TableRow key={post.id} className={cn("group hover:bg-pink-50/30 transition-colors border-gray-50 cursor-pointer", publishingId === post.id && "opacity-70 pointer-events-none")} onClick={() => onEditClick(post)}>
                                    <TableCell>
                                        <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden relative border border-gray-200 shadow-sm group-hover:scale-105 transition-transform">
                                            {post.mediaUrl ? (
                                                post.postType === 'video' ? (
                                                    <div className="w-full h-full bg-black relative flex items-center justify-center">
                                                        <video src={post.mediaUrl} className="w-full h-full object-cover" muted />
                                                        <div className="absolute inset-0 flex items-center justify-center"><Play className="h-4 w-4 text-white fill-white" /></div>
                                                    </div>
                                                ) : (<img src={post.mediaUrl} alt="" className="h-full w-full object-cover" />)
                                            ) : (<div className="h-full w-full flex items-center justify-center bg-pink-50 text-pink-200">No Media</div>)}
                                            {publishingId === post.id && (
                                                <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                                    <Loader2 className="h-4 w-4 animate-spin text-pink-600" />
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-gray-900 truncate max-w-md">{post.caption || "No caption provided"}</p>
                                            <div className="flex items-center gap-1.5">
                                                <Badge variant="outline" className="text-[9px] font-black uppercase text-pink-600 bg-pink-50 border-pink-100 rounded-md py-0 px-1.5">
                                                    {accounts.find(a => a.igUserId === post.pageId)?.username || "Instagram"}
                                                </Badge>
                                                <div className="w-1 h-1 rounded-full bg-gray-300" />
                                                <span className="text-[10px] text-gray-400 flex items-center gap-1 font-medium capitalize">{post.postType || "post"}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-tighter", post.status === 'published' ? "bg-green-100 text-green-700 hover:bg-green-100 border-green-200" : "bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200")}>
                                            {post.status || "published"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-4 text-xs font-bold text-gray-700">
                                            <div className="flex items-center gap-1"><Heart className="h-3.5 w-3.5 text-pink-500" /> {formatNumber(post.metrics?.likes)}</div>
                                            <div className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5 text-pink-500" /> {formatNumber(post.metrics?.comments)}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-900">
                                                {format(new Date(post.status === 'scheduled' ? post.scheduledAt : post.createdAt), "MMM dd, yyyy")}
                                            </span>
                                            <span className="text-[10px] font-medium text-gray-400">
                                                {format(new Date(post.status === 'scheduled' ? post.scheduledAt : post.createdAt), "h:mm a")}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-pink-100 text-gray-400 hover:text-pink-600"><MoreVertical className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-xl border-gray-100 p-1">
                                                {post.status === 'published' ? (
                                                    <>
                                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEditClick(post, 'analytics'); }} className="gap-2.5 text-xs font-black rounded-lg">
                                                            <BarChart3 className="h-4 w-4 text-blue-600" />
                                                            <span className="text-blue-600">Analytics</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEditClick(post); }} className="gap-2.5 text-xs font-black rounded-lg">
                                                            <Eye className="h-4 w-4" />
                                                            <span>View Details</span>
                                                        </DropdownMenuItem>
                                                    </>
                                                ) : (
                                                    <>
                                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEditClick(post); }} className="gap-2.5 text-xs font-black rounded-lg">
                                                            <Edit className="h-4 w-4" />
                                                            <span>Edit Post</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={(e) => handlePublishNow(e, post)} className="gap-2.5 text-xs font-black text-pink-600 rounded-lg focus:bg-pink-50 focus:text-pink-700">
                                                            <Send className="h-4 w-4" />
                                                            <span>Publish Now</span>
                                                        </DropdownMenuItem>
                                                        {onEdit && (
                                                            <DropdownMenuItem className="gap-2.5 text-xs font-black text-red-600 rounded-lg focus:bg-red-50 focus:text-red-700" onClick={(e) => { e.stopPropagation(); onEdit(post, 'delete'); }}>
                                                                <Trash2 className="h-4 w-4" />
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
            </Card>

            {pagination.hasMore && (
                <div className="flex justify-center pt-8">
                    <Button onClick={handleLoadMore} disabled={loading} variant="outline" className="w-full sm:w-auto min-w-[200px]">
                        {loading ? "Loading..." : "Load More Posts"}
                    </Button>
                </div>
            )}
        </div>
    );
}
